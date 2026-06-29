# MCCIA Hackathon

Business compliance and advisory dashboard built for a hackathon. Helps manage clients, deadlines, reminders, circulars, audit logs, advisor chat, and GST calculations using local datasets.

## What this project does

- Manage clients and their compliance profiles
- Track compliance calendar events and GST circulars
- Generate reminders, forecasts, and deadlines
- Access advisor chat and calculator tools
- Review audit logs and missed deadlines
- Work with local CSV and JSON datasets offline

## Tech stack

- Next.js 16.2.4
- React 19.2.4
- Tailwind CSS 4
- Google Generative AI SDK
- OpenRouter SDK
- XLSX parsing library

## Repo structure

```
app/
  advisor/page.js
  audit/page.js
  calculator/page.js
  calendar/page.js
  circulars/page.js
  clients/page.js
  logs/page.js
  reminders/page.js
  returns/page.js
  page.js
  layout.js
  globals.css
  api/
    advisor/route.js
    audit/route.js
    calendar/route.js
    chat/route.js
    circulars/route.js
    clients/route.js
    forecast/route.js
    logs/route.js
lib/
  data-loader.js
  deadline-calculator.js
  gst-calculator.js
  reminder-generator.js
public/
  client_profiles.csv
  compliance_calendar_master.csv
  compliance_qa_dataset.csv
  gst_circulars_index.json
  missed_deadlines_log.csv
  SVGs and icons
README.md
```

## Requirements

- Node.js 18+
- npm or pnpm

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Notes

- AI chat features need provider API keys.
- Local datasets are bundled for the hackathon build.

## Contributing

Keep changes scoped to one feature per PR and update this README when behavior changes.

## License

MIT
