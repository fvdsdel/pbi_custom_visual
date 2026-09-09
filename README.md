# Six Field Visual

A Power BI custom visual that accepts six data fields and renders each data row as a responsive grid of labeled values.

## Build

Install Node.js, then run:

```powershell
npm install
npx pbiviz package
```

The packaged visual is written to `dist\`.

## Cloud build with GitHub Actions

The repository includes `.github\workflows\package-visual.yml`. After uploading
this project to GitHub, open **Actions**, select **Package Power BI visual**, and
choose **Run workflow**. Download the `SixFieldVisual` artifact from the completed
run, extract it, and import the `.pbiviz` file into Power BI Desktop.
