
<style>
        /* Styling the container and images */
        .image-container {
            display: flex; /* Align images side by side */
            gap: 10px; /* Space between the images */
            justify-content: center; /* Center the images horizontally */
            align-items: center; /* Align the images vertically */
        }
        .project-pic {
            width: 650px; /* Set the image width */
            height: auto; /* Maintain aspect ratio */
            object-fit: contain; /* Ensure the image fits its bounding box */
            margin: 5px; /* Optional spacing around the image */
            border-radius: 8px; /* Optional rounded corners */
        }
    </style>
AmpleHarvest works to bridge the gap between farmers/donators with excess food and local food pantries.

The Problem: 

There exists discrepancies between relevant data (hours of operation, contact information) on a food pantry’s website (real-time data) and the AmpleHarvest.org database. Verifying and updating all relevant data was done manually and is extremely time-intensive. Some food pantries may have multiple avenues of communication, so this makes it challenging to determine most up-to-date information. 

To solve this, we built a basic spider pipeline for web scraping:
- MVP0: Basic spider pipeline for web scraping and data comparison using regex & LLM exploration including error handling, data extraction, and basic comparison scripts
- MVP1: Improve MVP 0 with LLM integration for improved data extraction and accuracy in discrepancy handling between scraped data and current database
- MVP2: Optimize pipeline for speed and accuracy, and reduce token usage by refining LLM input and adding geocoding API integration for address validation
<div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
    <img
        src="/img/AH2.png"
        alt="AH2"
        loading="lazy"
        class="project-pic"
    />
    <img
        src="/img/AH3.png"
        alt="AH3"
        loading="lazy"
        class="project-pic"
    />
</div>


The impact: Building the LLM-based web scraper dramatically reduces the time and cost AmpleHarvest.org spends on food pantry data verification for over 4,000 of their food pantries. Additionally, it would improve the user experience for gardeners donating to a food pantry and for hungry families who use AmpleHarvest.org to find a food pantry. Lastly, since this
information is freely shared with other nonprofits that support food pantries, it would benefit the operation and impact of numerous other food programs.

Skills: [Python, JSON manipulation, Spider Webscraping, API integration with multiple endpoints, LLM Parsing, LLM hallucination defense, One-shot prompting, Unit testing]

Collaborated with Harvard Undergrads through Harvard's Tech for Social Good