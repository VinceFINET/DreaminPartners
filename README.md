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

## Deploy to Salesforce (sandbox)

<a href="https://githubsfdeploy-sandbox.herokuapp.com/app/githubdeploy/VinceFINET/DreaminPartners?ref=main">  
  <img alt="Deploy to Salesforce (sandbox)" src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
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
 
## How do I pass visitors information to the application

- Make sure all the team agrees with a template that will be used to generate the information stored in the QRCode.
- The template can be a simple string or a JSON structure.
- Obviously in the template you need to identify the place where we can get the following information (all optional) about the attendee:
  - Firstname
  - Lastname
  - Company
  - Email
  - Phone
  - Reference to a Salesforce Record
- Some examples:
  - #1: `{ "name": { "firstname": "James", "lastname": "BOND" }, "company": "MI6",  "email": "james@bond.com", "phone": "+44 (0)12 345 6789" }`
  - #2: `{ "firstname": "James", "lastname": "BOND", "company": "MI6",  "reference": "003AW00000o4DCTYA2" }`
  - #3: `"James","BOND","003AW00000o4DCTYA2"`
- Below is an example of such QRCode following example #1:

<div align="center">
  <img src="./docs/qrcode-example.png" width="256" alt="Example of a QRCode" />
</div>

## Setting the LWC to scan codes
- Drag and drop the LeadScanner LWC in a flexipage
- You need to set its template regular expression, the target sobject you will use to capture the information for partner and then how do you map the information in the QRCode in this sobject.

### The template regular expression
- The template regular expression is a way for us to extract the information about the attendee
- From the template you agreed, you need to create a regular expression with predefined groups: F, L, C, E, P and K.
- As an illustration, here are corresponding regular expression to the previous examples:
  - #1: `{.*"name":.*{.*"firstname":.*"(?<F>.*)",.*"lastname":.*"(?<L>.*)".*},.*"company":.*"(?<C>.*)",.*"email":.*"(?<E>.*)",.*"phone":.*"(?<P>.*)".*}`
  - #2: `{.*"firstname":.*"(?<F>.*)",.*"lastname":.*"(?<L>.*)",.*"company":.*"(?<C>.*)",.*"reference":.*"(?<K>.*)".*}`
  - #3: `"(?<F>.*)","(?<L>.*)","(?<K>.*)"`

### The target SObject
- By default, the component will insert Leads but you can change this to any other object.
- Keep in mind that the current user needs "Create" permission to that object.
- This is the API Developer Name that we want here.

### The field names used in mapping
- Specify the fields to use when mapping the information into records.
- The fields need to exist in the previous given SObject.
- F stands for First name
- L stands for Last name
- C stands for Company
- E stands for Email
- P stands for Phone
- K stands for Reference
- Keep in mind that the current user needs "Update" permission to these fields.
- These are the API Developer Names that we want here.

## What happens if the scanner does not work?

- If for some reason your user experience an error while scanning, there is an alternative process for them to follow. So in short they can type the name and company of the lead (mandatory information) additionnaly can put phone and/or email address. And hit "save" button.
- Technical logs are available in the "log" tab if you need to understand what's happening there. But the most important is that our dear partners will not be blocked!

## How do I pass visitors information to the partners afterwards?

- The application creates Lead records when scanning and the owner of such records will be the partner's user.
- So typically a report filtered by user or company's users should be fine.
