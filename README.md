Leang Interactive Quiz Platform
A web-based application for creating and taking quizzes. Users can build quizzes with multiple-choice, true/false, or fill-in-the-blank questions and take quizzes with real-time feedback, a progress bar, and a timer. The platform is designed to be intuitive, responsive, and user-friendly.
Features

Quiz Builder: Create quizzes with customizable question types (multiple-choice, true/false, fill-in-the-blank).
Quiz Taker: Take quizzes with immediate feedback, a countdown timer, and score tracking.
Responsive Design: Built with Tailwind CSS for a seamless experience across devices.
Local Storage: Saves quizzes locally in the browser for persistent access.
Drag-and-Drop: Reorder questions and options using jQuery UI's sortable feature.
Modern UI: Enhanced with Lucide Icons and a clean, modern design.

Tech Stack

HTML5: Structure of the web app.
Tailwind CSS: Styling (via CDN).
jQuery & jQuery UI: Dynamic interactions and sortable functionality (via CDN).
Lucide Icons: Icons for buttons and UI elements (via CDN).
LocalStorage: Client-side storage for quizzes.

Setup

Clone the repository:git clone https://github.com/nolchhonleang/leang-interactive-quiz-platform.git


Navigate to the project directory:cd leang-interactive-quiz-platform


Open index.html in a web browser to run the application.

Usage

Build Quiz:
Click "Build Quiz" in the header.
Enter a quiz title and add questions (multiple-choice, true/false, or fill-in-the-blank).
For multiple-choice, add options and select the correct one.
Save the quiz to store it in localStorage.


Take Quiz:
Click "Take Quiz" to view saved quizzes.
Select a quiz to start, answer questions, and receive immediate feedback.
View your score and remaining time during the quiz.
Submit the quiz to see your final score.



Project Structure
leang-interactive-quiz-platform/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Custom CSS styles
├── js/
│   └── script.js       # JavaScript logic
├── README.md           # Project documentation
├── LICENSE             # MIT License
└── .gitignore          # Git ignore file


Future Improvements

Add server-side storage for quizzes (e.g., using a backend like Node.js or Firebase).
Implement user authentication for personalized quiz creation.
Add support for importing/exporting quizzes as JSON files.
Include analytics to track user performance.
Optimize for offline use by including local copies of dependencies.

Contributing
Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request with your changes.
License
This project is licensed under the MIT License. See the LICENSE file for details.
Contact
For questions or feedback, please open an issue on GitHub or contact the maintainer at Leang.codes@gmail.com
![image](https://github.com/user-attachments/assets/8d35c9f4-9a90-45b9-8364-0af9a8a0e240)

