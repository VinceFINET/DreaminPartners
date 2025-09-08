<div align="center">
  <img src="docs/dreaminpartnersapp-icon.png" width="256" alt="Dreamin Partners logo" />
  <h1>
    Dreamin Partners salesforce application
  </h1>
  <p>
    <b>Dreamin Partners</b> is a salesforce application that Dreamin Event organizers can propose to their partners while experiencing an event.
  </p>
  <a href="https://github.com/VinceFINET/DreaminPartners/network/members">
    <img alt="forks on github" src="https://img.shields.io/github/forks/VinceFINET/DreaminPartners?style=flat-square&logoColor=blue">
  </a>
  <a href="https://github.com/VinceFINET/DreaminPartners/stargazers">
    <img alt="stars on github" src="https://img.shields.io/github/stars/VinceFINET/DreaminPartners?style=flat-square">
  </a>
  <a href="https://github.com/VinceFINET/DreaminPartners/watchers">
    <img alt="watchers" src="https://img.shields.io/github/watchers/VinceFINET/DreaminPartners?style=flat-square">
  </a>
  <a href="https://github.com/VinceFINET/DreaminPartners/issues">
    <img alt="issues" src="https://img.shields.io/github/issues-raw/VinceFINET/DreaminPartners?style=flat-square">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img alt="licenses" src="https://img.shields.io/badge/License-MIT-yellow.svg">
  </a>
</div>

## Deploy to Salesforce (production and developer edition)

<a href="https://githubsfdeploy.herokuapp.com/app/githubdeploy/VinceFINET/DreaminPartners?ref=main">
  <img alt="Deploy to Salesforce (production)" src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>

## What's inside?

- 1 Custom App: Dreamin Partners
- 1 Custom Tab: 🏠 Home
- 1 Flexi Page: 🏠 Home
- 1 Custom LWC: leadScanner
- 1 Permission Set: Dreamin Partners User

<div align="center">
  <img src="./docs/dreaminpartnersapp-illustration.png" width="512" alt="Dreamin Partners illustration" />
</div>

## How my partners can use it?

- Step 1:
  - Make sure Lead is private OWD, and it has no Validation Rule or Trigger that could prevent from creating leads with only name, phone, company and email information.
  - Then install the application in your org.
- Step 2:
  - Create access to your org for your partners
- Step 3:
  - Assign your partner the Permission Set included in this package (so they can see and use the application).
  - Note that this step will grand read and create access to Lead for your partners as well.
- Step 4:
  - Have partners install the Salesforce mobile app on their phone or tablet
  - Make them authenticate to your org via the mobile app.
- Step 5:
  - The application is called "Dreamin Partners", on the home page of this app.
  - As of now, the only service that we provide is to scan visitors' QRCodes to generate leads for partners.
 
## How do I pass visitors information to the applicaiton

- When you print the QRCode in the visitors' badges, make sure the information in the QRCode is using this template:
```
{ 
    "name": { 
        "firstname": "James", 
        "lastname": "BOND"
    }, 
    "company": "MI6", 
    "email": "james@bond.com",
    "phone": "+44 (0)12 345 6789"
}
```
- The `name` property is mandatory with at least two propeties `firstname` and `lastname`. Any other properties are optional.
- Below is an example of such QRCode:

<div align="center">
  <img src="./docs/qrcode-example.png" width="256" alt="Example of a QRCode" />
</div>

## How do I pass visitors information to the partners afterwards?

- The application creates Lead records when scanning and the owner of such records will be the partner's user.
- So typically a report filtered by user or company's users should be fine.
