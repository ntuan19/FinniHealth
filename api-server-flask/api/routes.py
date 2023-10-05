# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from datetime import datetime, timezone, timedelta

from functools import wraps

from flask import request
from sqlalchemy import or_
from flask_restx import Api, Resource, fields
import jwt
import jsonify 
from .models import db, Users, JWTTokenBlocklist, Patient, Address, Field
from .config import BaseConfig
import requests
import sqlite3
from datetime import datetime
from requests_oauthlib import OAuth2Session
from flask import session, redirect 
rest_api = Api(version="1.0", title="Users API")
from .helper import VALID_STATUSES,is_valid_status



"""
    Flask-Restx models for api request and response data
"""

signup_model = rest_api.model('SignUpModel', {"username": fields.String(required=True, min_length=2, max_length=32),
                                              "email": fields.String(required=True, min_length=4, max_length=64),
                                              "password": fields.String(required=True, min_length=4, max_length=16)
                                              })

login_model = rest_api.model('LoginModel', {"email": fields.String(required=True, min_length=4, max_length=64),
                                            "password": fields.String(required=True, min_length=4, max_length=16)
                                            })

user_edit_model = rest_api.model('UserEditModel', {"userID": fields.String(required=True, min_length=1, max_length=32),
                                                   "username": fields.String(required=True, min_length=2, max_length=32),
                                                   "email": fields.String(required=True, min_length=4, max_length=64)
                                                   })


"""
   Helper function for JWT token required
"""

def token_required(f):

    @wraps(f)
    def decorator(*args, **kwargs):

        token = None

        if "authorization" in request.headers:
            token = request.headers["authorization"]
            print(token)

        if not token:
            return {"success": False, "msg": "Valid JWT token is missing"}, 400
        
        data = jwt.decode(token, BaseConfig.SECRET_KEY, algorithms=["HS256"])
        email_data = data["email"]
        user = Users.get_by_email(email=email_data)
        token_expired = db.session.query(JWTTokenBlocklist.id).filter_by(jwt_token=token).scalar()
        if token_expired is not None:
                return {"success": False, "msg": "Token revoked."}, 400

        if not user.check_jwt_auth_active():
                return {"success": False, "msg": "Token expired."}, 400

        return f(user, *args, **kwargs)
    return decorator

def fetch_user(res):
    data = res.json()
    access_token = data.get("access_token")
    headers = {'Authorization': f'Bearer {access_token}'}
    response = requests.get('https://openidconnect.googleapis.com/v1/userinfo', headers=headers)
    
    if response.status_code != 200:
        return {"status":False,"token":None,"user":None}
    user_info = response.json()
    print(user_info)
    google_id = user_info.get('sub')
    _email = user_info.get('email')
    user_name = _email.split("@")[0]
    # Check if user is already registered
    user = Users.query.filter_by(email=_email).first()
    if not user:
        user = Users( oauth_user_id=google_id, email=_email,username=user_name)
        user.save()
    token = jwt.encode({"email": _email, 'exp': datetime.utcnow() + timedelta(minutes=30)}, BaseConfig.SECRET_KEY)
    user.set_jwt_auth_active(True)
    user.save()
    return {"status":True,"token":token,"user":user.toJSON()}

@rest_api.route("/api/users/oauth_google")
class GoogleRegister(Resource):
    def post(self):
        data = request.get_json()
        scope = data["scope"]
        code = data["code"]
        client_id = BaseConfig.GOOGLE_CLIENT_ID
        client_secret = BaseConfig.GOOGLE_CLIENT_SECRET
        payload = {
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': "http://localhost:3000",
        'grant_type': 'authorization_code'
        }
        call_for_token = requests.post('https://oauth2.googleapis.com/token', data=payload)
        if call_for_token.status_code == 200:
            response = fetch_user(call_for_token)
            if response["status"] == True and response["token"]:
                return {"status":True,"token":response["token"],"user":response["user"]["email"]},200
        return {"status":False,"token":None,"user":None},400
            

@rest_api.route('/api/users/register')
class Register(Resource):
    """
       Creates a new user by taking 'signup_model' input
    """

    @rest_api.expect(signup_model, validate=True)
    def post(self):

        req_data = request.get_json()

        _username = req_data.get("username")
        _email = req_data.get("email")
        _password = req_data.get("password")

        user_exists = Users.get_by_email(_email)
        if user_exists:
            return {"success": False,
                    "msg": "Email already taken"}, 400

        new_user = Users(email=_email)

        new_user.set_password(_password)
        new_user.save()

        return {"success": True,
                "userID": new_user.id,
                "msg": "The user was successfully registered"}, 200


@rest_api.route('/api/users/login')
class Login(Resource):
    """
       Login user by taking 'login_model' input and return JWT token
    """

    @rest_api.expect(login_model, validate=True)
    def post(self):

        req_data = request.get_json()

        _email = req_data.get("email")
        _password = req_data.get("password")

        user_exists = Users.get_by_email(_email)

        if not user_exists:
            return {"success": False,
                    "msg": "This email does not exist."}, 400

        if not user_exists.check_password(_password):
            return {"success": False,
                    "msg": "Wrong credentials."}, 400

        # create access token uwing JWT
        token = jwt.encode({'email': _email, 'exp': datetime.utcnow() + timedelta(minutes=30)}, BaseConfig.SECRET_KEY)
        user_exists.set_jwt_auth_active(True)
        user_exists.save()

        return {"success": True,
                "token": token,
                "user": user_exists.toJSON()}, 200


@rest_api.route('/api/users/edit')
class EditUser(Resource):
    """
       Edits User's username or password or both using 'user_edit_model' input
    """

    @rest_api.expect(user_edit_model)
    @token_required
    def post(self, current_user):

        req_data = request.get_json()

        _new_username = req_data.get("username")
        _new_email = req_data.get("email")

        if _new_username:
            self.update_username(_new_username)

        if _new_email:
            self.update_email(_new_email)

        self.save()

        return {"success": True}, 200


@rest_api.route('/api/users/logout')
class LogoutUser(Resource):
    """
       Logs out User using 'logout_model' input
    """

    @token_required
    def post(self, current_user):

        _jwt_token = request.headers["authorization"]

        jwt_block = JWTTokenBlocklist(jwt_token=_jwt_token, created_at=datetime.now(timezone.utc))
        jwt_block.save()

        self.set_jwt_auth_active(False)
        self.save()

        return {"success": True}, 200


@rest_api.route("/api/users/add_patient",methods=["POST"])
class UserPatient(Resource):
    @token_required
    def post(self,user):
        req_data = request.get_json()
        print(req_data)
        name = req_data["name"]
        dateofbirth = req_data["dob"]
        date_format = '%Y-%m-%d'
        date_object = datetime.strptime(dateofbirth, date_format).date()
        status = req_data["status"]
        if not is_valid_status(status):
            return {"success": False, "message": "Invalid status value"}, 400
        addresses = req_data["addresses"]
        field_data = req_data["fields"]
        new_patient = Patient(name=name, dob=date_object,status = status)
        new_patient.save()        
        # Commit the session to get the id for the new patient
        
        # Add addresses to the patient
        for address in addresses:
            street = address["street"]
            city = address["city"]
            state = address["state"]
            zipcode = address["zipcode"]
            new_address = Address(patient_id=new_patient.id,street = street,city=city,state=state,zipcode=zipcode )
            new_address.save()
            
        # Add field data to the patient
        for field in field_data:
            new_field = Field(patient_id=new_patient.id, field_name=field["field_name"], field_value=field["field_value"])
            new_field.save()
        
        # Commit the session to save the addresses and fields to the database
        print("_________________________________")
        return {"success": True,
                "result": "Successfully Added New Patient"
                }, 200

@rest_api.route("/api/users/update_patient/<int:patient_id>")
class UpdatePatient(Resource):
    @token_required
    def put(self,user,patient_id):
        print("Got ehre")
        # Fetch the patient by id from the database
        patient = Patient.query.get(patient_id)
        
        if not patient:
            return {"success": False, "message": "Patient not found"}, 404
        req_data = request.get_json(silent=True)
        if req_data is None:
            return {"success": False, "error": "Invalid JSON format"}, 400
        if "name" in req_data:
            patient.name = req_data["name"]
        if "dob" in req_data:
            dateofbirth = req_data["dob"]
            date_format = '%Y-%m-%d'
            date_object = datetime.strptime(dateofbirth, date_format).date()
            patient.dob = date_object
        if "status" in req_data: 
            if not is_valid_status(req_data["status"]):
                return {"success": False, "message": "Invalid status value"}, 400
            patient.status = req_data["status"]
        if "address" in req_data:
            new_addresses = req_data["address"]
            
            # Update existing and add new addresses
            existing_addresses_ids = [address.id for address in patient.address]
            for address_data in new_addresses:
                if "id" in address_data and address_data["id"] in existing_addresses_ids:
                    # Update existing address
                    address = Address.query.get(address_data["id"])
                    address.street = address_data.get("street", address.street)
                    address.city = address_data.get("city", address.city)
                    address.state = address_data.get("state", address.state)
                    address.zipcode = address_data.get("zipcode", address.zipcode)
                else:
                    # Add new address
                    new_address = Address(patient_id=patient.id, **address_data)
                    db.session.add(new_address)
            
            # Delete addresses that were not in the received data
            for address in patient.address:
                if address.id not in [address_data.get("id") for address_data in new_addresses]:
                    db.session.delete(address)
        
        # Similar logic for updating field data
        if "fields" in req_data:
            new_fields = req_data["fields"]
            existing_field_ids = [field.id for field in patient.fields]
            for field_data in new_fields:
                if "id" in field_data and field_data["id"] in existing_field_ids:
                    # Update existing field
                    field = Field.query.get(field_data["id"])
                    field.field_name = field_data.get("field_name", field.field_name)
                    field.field_value = field_data.get("field_value", field.field_value)
                else:
                    # Add new field
                    new_field = Field(patient_id=patient.id, **field_data)
                    db.session.add(new_field)
            
            # Delete fields that were not in the received data
            for field in patient.fields:
                if field.id not in [field_data.get("id") for field_data in new_fields]:
                    db.session.delete(field)
        
        db.session.commit()
        return {"success": True,
                "result": "Successfully Edited New Patient",

                }, 200

@rest_api.route("/api/users/get_patient/<int:patient_id>")
class PatientInformation(Resource):
    @token_required
    def get(self, patient_id):
        # Query the database to get the patient by ID
        patient = Patient.query.get(patient_id)
        
        # If the patient does not exist, return an error
        if patient is None:
            return {"success": False, "message": "Patient not found"}, 404
        
        # If the patient exists, collect the information and return it
        patient_info = {
            "id": patient.id,
            "name": patient.name,
            "dob": patient.dob.isoformat(),
            "status": patient.status,
            "address": [{
                "street": address.street,
                "city": address.city,
                "state": address.state,
                "zipcode": address.zipcode,
            } for address in patient.address],

            "fields": [{
                "field_name": field.field_name,
                "field_value": field.field_value,
            } for field in patient.fields],
        }
        
        return {"success": True, "patient": patient_info}, 200


@rest_api.route("/api/users/dashboard")
class Dashboard(Resource):
    @token_required
    def get(self,user):
        # Connect to the SQLite database
        db_path = "/Users/ntuan_195/react-flask-authentication/api-server-flask/api/db.sqlite3"
        conn = sqlite3.connect(db_path)
        # Create a cursor object to execute SQL queries
        cursor = conn.cursor()
        # Execute the SQL queries and fetch the results
        cursor.execute("""
            SELECT patient.id, patient.name, patient.dob, patient.status, 
                address.street, address.city, address.state, address.zipcode
            FROM patient
            LEFT JOIN address ON patient.id = address.patient_id;
        """)
        patients_with_addresses = cursor.fetchall()
        
        cursor.execute("""
            SELECT patient.id, field.field_name, field.field_value
            FROM patient
            LEFT JOIN field ON patient.id = field.patient_id;
        """)
        patients_with_fields = cursor.fetchall()

        # Organize the results into a more structured format
        patients_info = {}
        for row in patients_with_addresses:
            patient_id, name, dob, status, street, city, state, zipcode = row
            if patient_id not in patients_info:
                patients_info[patient_id] = {
                    "id": patient_id,
                    "name": name,
                    "dob": dob,
                    "status": status,
                    "addresses": [],
                    "fields": []
                }
            if street:  # Check if address details are not None
                patients_info[patient_id]["addresses"].append({
                    "street": street,
                    "city": city,
                    "state": state,
                    "zipcode": zipcode
                })
        
        for row in patients_with_fields:
            patient_id, field_name, field_value = row
            if patient_id in patients_info:
                patients_info[patient_id]["fields"].append({
                    "field_name": field_name,
                    "field_value": field_value
                })
        
        # Close the cursor and connection
        cursor.close()
        conn.close()
        
        # Return the organized results
        return {"status_code":200,"patients":patients_info}

@rest_api.route("/api/users/search")
class GeneralSearch(Resource):
    @token_required
    def get(self,user):
        # Get search query parameter
        query = request.args.get('query', default="", type=str)
        print(query)
        # Perform search query in the database
        patients = db.session.query(Patient).join(Address, isouter=True).join(Field, isouter=True).filter(
            or_(
                Patient.name.like(f'%{query}%'),
                Patient.status.like(f'%{query}%'),
                Address.street.like(f'%{query}%'),
                Address.city.like(f'%{query}%'),
                Address.state.like(f'%{query}%'),
                Address.zipcode.like(f'%{query}%'),
                Field.field_name.like(f'%{query}%'),
                Field.field_value.like(f'%{query}%')
            )
        ).distinct().all()

        
        # Format the results
        results = [{
            "id": patient.id,
            "name": patient.name,
            "dob": patient.dob.isoformat(),
            "status": patient.status.value,
            "addresses": [{
                "street": address.street,
                "city": address.city,
                "state": address.state,
                "zipcode": address.zipcode,
            } for address in patient.address],
            "fields": [{
                "field_name": field.field_name,
                "field_value": field.field_value,
            } for field in patient.fields],
        } for patient in patients]
        
        return {"success": True, "patients": results}, 200

@rest_api.route("/api/users/status_counts")
class StatusCounts(Resource):
    @token_required
    def get(self, user):
        print("Get here?")
        PatientStatus = {
            "Inquiry": "Inquiry",
            "Onboarding": "Onboarding",
            "Active": "Active",
            "Churned": "Churned"
        }
        status_counts = {}
        # Iterate over each status type and count the patients
        for status in PatientStatus:
            count = db.session.query(Patient).filter(Patient.status == status).count()
            status_counts[status] = 0
            status_counts[status] += count
        print(status_counts)
        return {"success": True, "status_counts": status_counts}, 200


