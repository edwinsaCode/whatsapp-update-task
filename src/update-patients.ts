import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

// Normalisasi nomor telepon (contoh aturan sederhana)
function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, ""); // hapus karakter selain angka

  if (cleaned.startsWith("62")) {
    return cleaned;
  }
  if (cleaned.startsWith("0")) {
    return "62" + cleaned.substring(1);
  }
  if (!cleaned.startsWith("62")) {
    return "62" + cleaned;
  }

  return cleaned;
}

function main() {
  // 1. Load CSV
  const csvPath = path.join(__dirname, "../data/whatsapp.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  // Buat map nik -> phone
  const phoneMap: Record<string, string> = {};
  records.forEach((row: any) => {
    phoneMap[row.nik_identifier] = normalizePhone(row.phone_number);
  });

  // 2. Load patients
  const patientsPath = path.join(__dirname, "../data/patients-data.json");
  const patientsData = JSON.parse(fs.readFileSync(patientsPath, "utf-8"));

  const updatedPatients = patientsData.patients_before_phone_update.map((p: any) => {
    const nikIdentifier = p.resource.identifier.find(
      (id: any) => id.system === "https://fhir.kemkes.go.id/id/nik"
    )?.value;

    if (nikIdentifier && phoneMap[nikIdentifier]) {
      p.resource.telecom = [
        {
          system: "phone",
          use: "mobile",
          value: phoneMap[nikIdentifier],
        },
      ];
    }

    return p;
  });

  const output = {
    patients_after_phone_update: updatedPatients,
  };

  // 3. Save output
  const outPath = path.join(__dirname, "../output/patients-updated.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");

  console.log("✅ Patients updated saved to output/patients-updated.json");
}

main();
