# GreenMap AI

A renewable energy platform for India: find energy shops on a map, buy products, search and compare solar and wind equipment, check government schemes, and get energy-saving advice from the EMBER assistant.

Everything runs in the browser as static pages, with Firebase (Google sign-in and Firestore) as the backend. It is hosted on GitHub Pages.

## Pages

| File | What it does |
|---|---|
| `GreenMap_App.html` | Home page. Menu, notification bell, EMBER assistant, language, feedback, and admin tools. |
| `EnergyHub.html` | Local marketplace. Map of energy shops, shop profiles, cart, checkout with saved addresses, order tracking, followers, shop and parcel ratings, and a seller dashboard. |
| `Energy_Scope.html` | EnergyScope, the energy map and data view linked from the home page. |
| `Smart_Energy_Search.html` | Search and compare solar panels, wind turbines and batteries, with specs, pros and cons, and a score. |
| `Govt_Schemes.html` | Central and state renewable energy schemes (PM Surya Ghar, PM-KUSUM, state top-ups and more) with steps to apply. |

## Main features

**For customers**
- Browse shops on a map, follow shops, add products to a cart and pay.
- Save delivery addresses and choose one at checkout.
- Track each order, and get a notification at every stage of the parcel.
- After delivery, rate the shop (1 to 10) and the parcel or product (1 to 10) separately.
- Get notified when a followed shop adds products or changes offers.

**For shop owners**
- Notifications for every new order (product, who placed it, where it goes), successful payment, new follower, and every rating or review.
- Orders screen shows the delivery address and what the customer rated for the shop and the parcel.
- Followers list with names and profile photos.

**For the admin**
- Notification when a new user signs in with Google for the first time.
- Feedback from the Home menu (1 to 10 rating and message) arrives as a notification.
- "Post App Update" in the menu sends new-feature announcements to all users.

## Tech
- Plain HTML, CSS and JavaScript (no build step).
- Firebase Authentication (Google sign-in) and Cloud Firestore.
- Leaflet-style map in EnergyHub, hosted on GitHub Pages.
- Runs on the free Firebase Spark plan. No Cloud Functions are needed.

## Set up your own copy
1. Create a Firebase project and add a Web app. Copy its config into the `firebaseConfig` object in `EnergyHub.html` and `GreenMap_App.html`.
2. Enable Google sign-in in Authentication, and add your GitHub Pages domain under Authentication > Settings > Authorized domains.
3. Create a Firestore database, then paste the rules from `FIREBASE_UPDATE.md` (section 3) into Firestore > Rules and publish.
4. Upload all `.html` files to a GitHub repository and turn on GitHub Pages (Settings > Pages).
5. Open the site, sign in, and run the test checklist in `FIREBASE_UPDATE.md`.

The Firebase web config is not a secret. Your data is protected by the Firestore security rules, so always publish those rules before sharing the site.

## Admin
The admin account is set by the `ADMIN_EMAIL` value in `GreenMap_App.html` and in the Firestore rules. Change both if you use a different admin email.

## Project notes
- `FIREBASE_UPDATE.md` holds all Firebase code, the data model, the test checklist and a change log.
- `UPDATE_DETAILS.md` records every change made to the app.

## Data sources
Scheme and product details were collected from public sources (MNRE and other government announcements, industry news sites, and supplier listings) in October 2026. Prices are approximate market figures and can change, and scheme rules can be revised, so confirm on the official portals before applying or buying.

## Author
Shaik Mahamad Jashu K
