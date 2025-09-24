# whatsapp-update-task
Interview task: sync Whatsapp data with FHIR Patient records


## Part A – Phone Update Script

This project contains a script to update patient phone numbers based on a daily WhatsApp data sheet.

### How to Run

1. **Install dependencies**

   ```bash
   pnpm install

2. **Run the script**

   ```bash
   pnpm exec ts-node src/update-patients.ts

3. **Check the output**

   The updated patients bundle will be saved to `output/patients-updated.json`

Input Files:
- `data/whatsapp.csv`
    .The Whatsapp update sheet (exported as CSV)
- `data/patients-data.json`  
    .The initial patients data bundle (patients_before_phone_update)

Normalization Rules
Phone numbers are cleaned before being applied:
- Remove all non-digit characters
- If the number starts with 62, keep it as is
- If the number starts with 0, remove the leading zero and add 62
- If the number doesn't start with 62 or 0, add 62 at the beginning

Assumptions:
- Each patient is identified by a uniqueNIK (NIK identifier)
- Only patients with matching NIK in the CSV will have their telecom field updated
- Existing telecom entries are replaced with the new WhatsApp number


4. **Example Run**
   
Input patient before:
```json
{
  "resource": {
    "id": "patient-001",
    "identifier": [
      {
        "system": "https://fhir.kemkes.go.id/id/nik",
        "value": "3171044203920001"
      }
    ]
  }
}
```

Input patient after:
```json
{
  "resource": {
    "id": "patient-001",
    "identifier": [
      {
        "system": "https://fhir.kemkes.go.id/id/nik",
        "value": "3171044203920001"
      }
    ],
    "telecom": [
      {
        "system": "phone",
        "use": "mobile",
        "value": "6281234567890"
      }
    ]
  }
}
```

