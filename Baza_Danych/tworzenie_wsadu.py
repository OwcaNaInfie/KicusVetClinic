import os
import json
import random
from faker import Faker

# Initialize Faker for random data generation
fake = Faker('pl_PL')  # Use Polish locale for names and addresses

# Directory paths for the components
directories = {
    "KontoPacjenta": "KontoPacjenta",
    "Zwierze": "Zwierze",
    "KontoLekarza": "KontoLekarza",
    "Wizyta": "Wizyta"
}

# File paths for breed lists
breed_files = {
    "dog": "dog_breeds.txt",
    "cat": "cat_breeds.txt",
    "rabbit": "rabbit_breeds.txt"
}

# Ensure the directories exist
for dir_name in directories.values():
    if not os.path.exists(dir_name):
        os.makedirs(dir_name)

# Helper function to read breeds from a file
def read_breeds(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        breeds = [line.strip() for line in f.readlines()]
    return breeds

# Load breed lists from files
dog_breeds = read_breeds(breed_files["dog"])
cat_breeds = read_breeds(breed_files["cat"])
rabbit_breeds = read_breeds(breed_files["rabbit"])

# Helper function to create random pet data
# Helper function to create random pet data
def create_pet_data(pet_id):
    pet_type = random.choice(["Pies", "Kot", "Królik"])  # Corrected "Królika" to "Królik"
    if pet_type == "Pies":
        breed = random.choice(dog_breeds)
    elif pet_type == "Kot":
        breed = random.choice(cat_breeds)
    else:
        breed = random.choice(rabbit_breeds)

    # Predefined list of owner's notes
    notatki_list = [
        "Lubi gryźć.",
        "Lubi warczeć.",
        "Boi się wiatraków.",
        "Boi się lekarzy w niebieskich strojach.",
        "Boi się okularów."
    ]

    # Randomly decide if the note will be empty or selected from the list
    notatki = random.choice(
        notatki_list) if random.random() > 0.3 else ""  # 70% chance of having a note, 30% chance of being empty

    return {
        "id": pet_id,  # Pet's unique ID
        "imię": fake.first_name(),
        "wiek": random.randint(1, 20),
        "rasa": breed.title(),
        "gatunek": pet_type,  # Corrected "Królika" to "Królik"
        "waga": round(random.uniform(1.5, 10.0), 2),
        "kolor": random.choice(["Brązowy", "Czarny", "Biały", "Szary"]),
        "notatki_od_wlasciciela": notatki  # 30% chance of empty notes
    }


# Helper function to create random doctor data
def create_doctor_data(doctor_id):
    return {
        "id": doctor_id,
        "imie": fake.first_name(),
        "nazwisko": fake.last_name(),
        "numer_telefonu": "+48 " + str(random.randint(100, 999)) + " " + str(random.randint(100, 999)) + " " + str(random.randint(100, 999)),
        "adres_email": fake.email(),
        "specjalizacja": random.choice(["Chirurgia weterynaryjna", "Kardiologia", "Okulistyka", "Dermatologia"]),
    }

# Helper function to create random visit data
def create_visit_data(doctor_ids, visit_id):
    odbyta = random.choice([True, False])  # Randomly decide if the visit occurred

    # Predefined list of doctor recommendations
    zalecenia_list = [
        "Dawać więcej jeść.",
        "Dawać mniej jeść.",
        "Więcej chodzić na spacery.",
        "Ogolić na łyso.",
        "Dawać aspirynę.",
        "Nie dawać czekolady.",
        "Pawulonik."
    ]

    # Randomly select a recommendation
    zalecenia_lekarza = random.choice(zalecenia_list)

    return {
        "id_wizyty": visit_id,  # Sequential visit ID starting from 1
        "data": fake.date_this_year().strftime('%Y-%m-%d'),
        "doktor_id": random.choice(doctor_ids),  # Randomly choose a doctor for the visit
        "zalecenia_lekarza": zalecenia_lekarza,  # Random recommendation from the list
        "informacja_czy_wizyta_sie_odbyla": odbyta  # Whether the visit was completed or canceled
    }

# Helper function to create random patient account data
def create_patient_data(patient_id, pet_ids, visits):
    # Split the visits into scheduled and completed
    scheduled_visits = [visit['id_wizyty'] for visit in visits if not visit['informacja_czy_wizyta_sie_odbyla']]
    completed_visits = [visit['id_wizyty'] for visit in visits if visit['informacja_czy_wizyta_sie_odbyla']]

    return {
        "id": patient_id,  # Patient's unique ID
        "imie": fake.first_name(),
        "nazwisko": fake.last_name(),
        "numer_telefonu": "+48 " + str(random.randint(100, 999)) + " " + str(random.randint(100, 999)) + " " + str(random.randint(100, 999)),
        "adres_email": fake.email(),
        "zwierzeta": pet_ids,  # List of pet IDs
        "umowione_wizyty": scheduled_visits,  # List of scheduled visit IDs
        "odbyte_wizyty": completed_visits  # List of completed visit IDs
    }

# Function to generate random files
def generate_random_files(num_files=1000):
    # Initialize IDs for patients, doctors, and pets
    patient_id = 1
    doctor_id = 1
    pet_id = 1
    visit_id = 1  # Visit IDs will now start from 1
    doctor_ids = []  # List to store all doctor IDs for random selection in visits

    # Create sample data for each component
    for i in range(num_files):
        # 1. Generate KontoLekarza data
        doctor = create_doctor_data(doctor_id)
        doctor_filename = os.path.join(directories["KontoLekarza"], f"lekarz_{doctor_id}.json")
        with open(doctor_filename, 'w', encoding='utf-8') as lekarz_file:
            json.dump(doctor, lekarz_file, indent=4, ensure_ascii=False)

        # Add the doctor ID to the list of doctor IDs
        doctor_ids.append(doctor_id)

        # 2. Generate Zwierze data (each pet gets its own file)
        pets = []
        for _ in range(random.randint(1, 3)):
            pet = create_pet_data(pet_id)
            pet_filename = os.path.join(directories["Zwierze"], f"zwierze_{pet['id']}.json")
            with open(pet_filename, 'w', encoding='utf-8') as pet_file:
                json.dump(pet, pet_file, indent=4, ensure_ascii=False)
            pets.append(pet['id'])  # Collect pet IDs to associate with the patient
            pet_id += 1

        # 3. Generate Wizyta data
        visits = [create_visit_data(doctor_ids, visit_id) for _ in range(random.randint(1, 5))]
        for visit in visits:
            visit_filename = os.path.join(directories["Wizyta"], f"wizyta_{visit['id_wizyty']}.json")
            with open(visit_filename, 'w', encoding='utf-8') as visit_file:
                json.dump(visit, visit_file, indent=4, ensure_ascii=False)
            visit_id += 1  # Increment visit ID for each new visit

        # 4. Generate KontoPacjenta data
        pacjent_data = create_patient_data(patient_id, pets, visits)
        pacjent_filename = os.path.join(directories["KontoPacjenta"], f"pacjent_{patient_id}.json")
        with open(pacjent_filename, 'w', encoding='utf-8') as pacjent_file:
            json.dump(pacjent_data, pacjent_file, indent=4, ensure_ascii=False)

        # Increment IDs for next patient, doctor, and pet
        patient_id += 1
        doctor_id += 1

# Run the generator to create 1000 files for testing
generate_random_files(num_files=1000)

print("Sample data generation complete. 1000 files created.")
