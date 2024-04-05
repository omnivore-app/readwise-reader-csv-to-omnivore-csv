import * as fs from "fs";
import * as csvParser from "csv-parser";

interface InputRow {
  Title: string;
  URL: string;
  Document_tags: string;
  Saved_date: string;
  Reading_progress: number;
  Location: string;
  Seen: boolean;
}

interface OutputRow {
  url: string;
  state: string;
  labels: string;
  saved_at: string;
  published_at: string;
}
function escapeLabels(labelString: string): string {
  if (!labelString || labelString.length < 1) {
    return "";
  }
  // Remove single quotes from the input string
  const cleanedString = labelString.replace(/'/g, "");
  // Split the cleaned string into individual label names
  const labels = cleanedString
    .slice(1, -1)
    .split(",")
    .map((label) => label.trim());
  // Escape and format labels
  return "[" + labels.map((label) => `""${label}""`).join(", ") + "]";
}

async function convertCSV(inputRows: InputRow[]): Promise<OutputRow[]> {
  const outputRows: OutputRow[] = inputRows.map((row) => {
    const state =
      row.Location.toLowerCase() === "archive" ? "ARCHIVED" : "SUCCEEDED";
    const labels = escapeLabels(row.Document_tags);
    const saved_at = row.Saved_date
      ? new Date(row.Saved_date).getTime().toString()
      : "";
    const published_at = ""; // Assuming we don't have this information in the input
    return {
      url: row.URL,
      state: state,
      labels: labels,
      saved_at: saved_at,
      published_at: published_at,
    };
  });

  return outputRows;
}

async function processCSV(filePath: string): Promise<OutputRow[]> {
  return new Promise<OutputRow[]>((resolve, reject) => {
    const rows: InputRow[] = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row: any) => {
        rows.push({
          Title: row.Title,
          URL: row.URL,
          Document_tags: row["Document tags"],
          Saved_date: row["Saved date"],
          Reading_progress: parseFloat(row["Reading progress"]),
          Location: row.Location,
          Seen: row.Seen === "True",
        });
      })
      .on("end", () => {
        resolve(convertCSV(rows));
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

// Example usage:
if (process.argv.length > 2) {
  const filePath = process.argv[2];
  processCSV(filePath)
    .then((outputRows) => {
      outputRows.forEach((row) => {
        console.log(
          `"${row.url}","${row.state}","${row.labels}","${row.saved_at}","${row.published_at}"`
        );
      });
    })
    .catch((err) => {
      console.error(err);
    });
} else {
  console.error("Please provide a CSV file path.");
}
