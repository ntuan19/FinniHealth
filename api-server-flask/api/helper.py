VALID_STATUSES = ["Inquiry", "Onboarding", "Active", "Churned"]

def is_valid_status(status):
    return status in VALID_STATUSES