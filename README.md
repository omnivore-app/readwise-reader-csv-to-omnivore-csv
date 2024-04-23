# readwise-reader-csv-to-omnivore-csv

This is a commandline tool to convert CSV files exported from Reader to Omnivore's import format. It will migrate URLs, labels, saved data, and will set the status to ARCHIVED if the item is in the archive location.

To use the tool first install dependencies:

```
npm install
```

Then run `start` passing your exported CSV file as the single parameter. The output is written to `omnivore_file.csv` file.

```
npm run start reader_file.csv
```

