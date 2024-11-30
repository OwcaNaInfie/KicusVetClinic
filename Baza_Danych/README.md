# KicusVetClinic

Ta?
To zajebiście.

## 1. Data Classes

### COMPONENT - Patient Account:

- Owner's full name: *string*
- Phone number: *string*
- Email address: *string*
- Animals[]: *Animal*
- Scheduled appointments[]: *Appointment*
- Visit history with doctor recommendations (e.g., medications, dosages, etc.)[]: *Appointment*

### COMPONENT - *Animal*:

- Name: *string*
- Age: *int*
- Breed: *enum*
- Species: *enum*
- Weight: *float*
- Color: *enum*
- Chip id: *id*
- Owner's notes: *string*

### COMPONENT - Doctor Account:

- Full name: *string*
- Phone number: *string*
- Email address: *string*
- Specialization: *enum*
- Scheduled appointments[]: *Appointment*
- Ability to mark an *Appointment* as completed/canceled: bool
- Add post-visit recommendations: *string*

### COMPONENT - *Appointment*:

- *Appointment* id: *id*
- Date: *string*
- Doctor: Doctor
- Doctor's recommendations: *string*
- Information on whether the *Appointment* took place or was canceled: bool


## 2. Functionality

**User Registration and Login:** The application will offer a simple registration (email, password) and login system for both patient and doctor accounts.

**Patient and Doctor Profiles:** Pet owners can create profiles for their pets, adding details such as name, species, breed, date of birth, and weight. This allows doctors to easily review the patient’s information before the *Appointment*.

***Appointment* Booking:** A key feature allowing users to view available times and book appointments with a chosen doctor. Users can filter *Appointment* slots by type (e.g., routine check-up, vaccination, specialist consultation) to find the most suitable time.

**Notifications and Reminders:** The system sends push notifications or email reminders before upcoming appointments, helping owners remember the *Appointment* and any necessary preparations, reducing the risk of no-shows.

**Visit History:** Each *Animal* profile contains a history of past appointments and procedures, making it easy for both doctors and owners to access health information.

**Doctor's Calendar:** Each doctor has access to manage their schedule within the app, including updating availability and adjusting appointments in real-time. Owners can see only the available slots.

**Access to Doctor's Recommendations:** After an *Appointment*, the doctor can enter care recommendations, medications, or further actions. The owner has access to these recommendations in the app and can refer to them anytime.

**Personal Notes for Owners:** The owner can add private notes on their pet's health, such as changes in behavior or symptoms, making it easier to track and discuss during appointments.
