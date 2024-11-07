import requests
from bs4 import BeautifulSoup
import asyncio
from playwright.async_api import async_playwright

def extract_dog_breeds(url, output_file="dog_breeds.txt"):
    try:
        # Fetch the webpage content
        response = requests.get(url)
        response.raise_for_status()

        # Parse the content
        soup = BeautifulSoup(response.text, 'html.parser')

        # Find all dog breed names based on the HTML class used
        breed_elements = soup.find_all('a', class_='listView-item-title--homepageBreed')

        # Extract the breed names and store them in a list
        breeds = [element.get_text(strip=True) for element in breed_elements]

        # Write breeds to a text file with UTF-8 encoding
        with open(output_file, "w", encoding="utf-8") as file:
            for breed in breeds:
                file.write(breed + "\n")

        print(f"Dog breeds successfully extracted and saved to {output_file}")

    except requests.RequestException as e:
        print(f"Error fetching the webpage: {e}")


def extract_cat_breeds(url, output_file="cat_breeds.txt"):
    try:
        # Fetch the webpage content
        response = requests.get(url)
        response.raise_for_status()

        # Parse the content with BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')

        # Find the div with class 'txt from-opacity'
        breed_elements = soup.find_all('div', class_='txt from-opacity')

        # Extract the breed names and store them in a list
        breeds = [element.get_text(strip=True) for element in breed_elements]

        # Write the breeds to a text file with UTF-8 encoding
        with open(output_file, "w", encoding="utf-8") as file:
            for breed in breeds:
                file.write(breed + "\n")

        print(f"Cat breeds successfully extracted and saved to {output_file}")

    except requests.RequestException as e:
        print(f"Error fetching the webpage: {e}")


async def extract_cat_breeds(url, output_file="cat_breeds.txt"):
    try:
        # Launch the browser with Playwright
        async with async_playwright() as p:
            # Launch a headless browser (no UI)
            browser = await p.chromium.launch(headless=False)
            page = await browser.new_page()

            # Go to the URL
            await page.goto(url)

            # Wait for the content to load (you can adjust the waiting time)
            await page.wait_for_selector('.txt.from-opacity')  # Make sure the element is present

            # Get the page content after JavaScript has rendered
            page_content = await page.content()

            # Parse the page with BeautifulSoup
            soup = BeautifulSoup(page_content, 'html.parser')

            # Find all breed elements
            breed_elements = soup.find_all('div', class_='txt from-opacity')

            # Extract breed names
            breeds = [element.get_text(strip=True) for element in breed_elements]

            # Write to a text file
            with open(output_file, "w", encoding="utf-8") as file:
                for breed in breeds:
                    file.write(breed + "\n")

            print(f"Cat breeds successfully extracted and saved to {output_file}")

            # Close the browser
            await browser.close()

    except Exception as e:
        print(f"Error fetching the webpage: {e}")


def extract_rabbit_breeds(url, output_file='rabbit_breeds.txt'):
    """
    Extracts all rabbit breed names from a given Wikipedia page and appends them to a text file,
    ensuring no duplicates are saved.

    Args:
    - url (str): URL of the Wikipedia page to extract information from.
    - output_file (str): Name of the file where the breed names will be saved.

    Returns:
    - None
    """
    try:
        # Send a request to the page
        response = requests.get(url)

        # Check if the request was successful (status code 200 means OK)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')

            # Find all <a> tags with a title attribute that starts with 'Królik'
            breed_links = soup.find_all('a', title=lambda x: x and x.startswith('Królik'))

            # Use a set to store breed names to ensure uniqueness
            breed_names = set()

            # Extract breed names and add to the set
            for link in breed_links:
                breed_name = link.get_text().strip()  # Extract the breed name and remove extra spaces
                breed_names.add(breed_name)
                print(f'Extracted: {breed_name}')

            # Write unique breed names to the text file
            with open(output_file, 'w') as file:
                for breed_name in breed_names:
                    file.write(f'{breed_name}\n')

            print(f'\n{len(breed_names)} unique breed names have been saved to "{output_file}".')
        else:
            print(f"Error: Unable to retrieve webpage. Status code: {response.status_code}")

    except Exception as e:
        print(f"An error occurred: {e}")

# Example usage
#extract_dog_breeds("https://wamiz.pl/pies/rasy")
#extract_cat_breeds("https://www.whiskas.pl/rasy-kotow")
extract_rabbit_breeds("https://pl.wikipedia.org/wiki/Rasy_kr%C3%B3lika")
