
// Initialize Lucide icons
lucide.createIcons();

// Global variables for Quiz Taker
let currentQuizData = null;
let currentQuestionIndex = 0;
let userAnswers = {}; // Stores user's selected/entered answers
let quizTimerInterval = null;
let quizTimeRemaining = 0;

/**
 * Displays a custom modal message.
 * @param {string} message - The message to display.
 */
function showModal(message) {
    $('#modal-message').text(message);
    $('#app-modal').removeClass('hidden');
}

/**
 * Generates a unique ID for dynamic elements.
 * @returns {string} A unique ID string.
 */
function generateUniqueId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Renders the quiz builder section and hides the taker section.
 */
function showQuizBuilder() {
    $('#quiz-builder-section').removeClass('hidden');
    $('#quiz-taker-section').addClass('hidden');
    $('#quiz-title').val('');
    $('#questions-container').empty();
}

/**
 * Renders the quiz taker section and hides the builder section.
 * Loads available quizzes.
 */
function showQuizTaker() {
    $('#quiz-builder-section').addClass('hidden');
    $('#quiz-taker-section').removeClass('hidden');
    loadAvailableQuizzes();
}

/**
 * Loads quizzes from localStorage and displays them in the quiz list.
 */
function loadAvailableQuizzes() {
    const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    const $quizList = $('#quiz-list');
    $quizList.empty();

    if (quizzes.length === 0) {
        $quizList.append('<p id="no-quizzes-message" class="text-gray-500 text-center col-span-full">No quizzes saved yet. Go to "Build Quiz" to create one!</p>');
        return;
    }

    $('#no-quizzes-message').remove();

    $.each(quizzes, function(index, quiz) {
        const quizCard = `
            <div class="bg-blue-50 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200 border border-blue-200 flex flex-col justify-between">
                <div>
                    <h4 class="text-xl font-bold text-blue-800 mb-2">${quiz.title}</h4>
                    <p class="text-gray-600 mb-4">${quiz.questions.length} Questions</p>
                </div>
                <div class="flex space-x-2 mt-4">
                    <button data-quiz-index="${index}" class="start-quiz-btn flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 font-semibold">
                        <i data-lucide="play" class="inline-block w-4 h-4 mr-1 align-middle"></i> Start Quiz
                    </button>
                    <button data-quiz-index="${index}" class="delete-quiz-btn px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200 font-semibold">
                        <i data-lucide="trash-2" class="inline-block w-4 h-4 align-middle"></i>
                    </button>
                </div>
            </div>
        `;
        $quizList.append(quizCard);
    });
    lucide.createIcons();
}

/**
 * Starts a selected quiz.
 * @param {number} quizIndex - The index of the quiz in the localStorage array.
 */
function startQuiz(quizIndex) {
    const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    currentQuizData = quizzes[quizIndex];

    if (!currentQuizData) {
        showModal('Error: Quiz not found.');
        return;
    }

    currentQuestionIndex = 0;
    userAnswers = {};
    $('#quiz-score').text(0);
    $('#quiz-total-questions').text(currentQuizData.questions.length);
    $('#current-quiz-title').text(currentQuizData.title);
    $('#quiz-list').addClass('hidden');
    $('#quiz-play-area').removeClass('hidden');

    quizTimeRemaining = currentQuizData.questions.length * 60;
    startQuizTimer();
    displayQuestion();
}

/**
 * Starts or resets the quiz timer.
 */
function startQuizTimer() {
    if (quizTimerInterval) {
        clearInterval(quizTimerInterval);
    }
    quizTimerInterval = setInterval(function() {
        quizTimeRemaining--;
        const minutes = Math.floor(quizTimeRemaining / 60);
        const seconds = quizTimeRemaining % 60;
        $('#quiz-timer').text(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);

        if (quizTimeRemaining <= 0) {
            clearInterval(quizTimerInterval);
            showModal('Time is up! Submitting your quiz.');
            submitQuiz();
        }
    }, 1000);
}

/**
 * Displays the current question in the quiz taker.
 */
function displayQuestion() {
    const question = currentQuizData.questions[currentQuestionIndex];
    const $questionDisplay = $('#question-display');
    $questionDisplay.empty();

    if (!question) {
        showModal('Error: Question not found.');
        return;
    }

    let questionHtml = `
        <div class="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
            <p class="text-lg font-semibold text-gray-800 mb-4">Q${currentQuestionIndex + 1}: ${question.questionText}</p>
    `;

    if (question.type === 'multiple-choice') {
        questionHtml += `<div class="space-y-3">`;
        $.each(question.options, function(index, option) {
            const optionId = generateUniqueId();
            const isChecked = userAnswers[currentQuestionIndex] === option;
            questionHtml += `
                <label for="${optionId}" class="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition duration-150 ${isChecked ? 'selected-answer' : ''}">
                    <input type="radio" id="${optionId}" name="mcq-option-${currentQuestionIndex}" value="${option}" class="mr-3 quiz-answer-input" ${isChecked ? 'checked' : ''}>
                    <span class="text-gray-700">${option}</span>
                </label>
            `;
        });
        questionHtml += `</div>`;
    } else if (question.type === 'true-false') {
        const trueId = generateUniqueId();
        const falseId = generateUniqueId();
        const isTrueChecked = userAnswers[currentQuestionIndex] === 'True';
        const isFalseChecked = userAnswers[currentQuestionIndex] === 'False';
        questionHtml += `
            <div class="flex flex-col sm:flex-row gap-4">
                <label for="${trueId}" class="flex-1 flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition duration-150 ${isTrueChecked ? 'selected-answer' : ''}">
                    <input type="radio" id="${trueId}" name="tfq-option-${currentQuestionIndex}" value="True" class="mr-3 quiz-answer-input" ${isTrueChecked ? 'checked' : ''}>
                    <span class="text-gray-700">True</span>
                </label>
                <label for="${falseId}" class="flex-1 flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition duration-150 ${isFalseChecked ? 'selected-answer' : ''}">
                    <input type="radio" id="${falseId}" name="tfq-option-${currentQuestionIndex}" value="False" class="mr-3 quiz-answer-input" ${isFalseChecked ? 'checked' : ''}>
                    <span class="text-gray-700">False</span>
                </label>
            </div>
        `;
    } else if (question.type === 'fill-in-the-blank') {
        const userAnswer = userAnswers[currentQuestionIndex] || '';
        questionHtml += `
            <input type="text" value="${userAnswer}" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent quiz-answer-input" placeholder="Your answer...">
        `;
    }

    questionHtml += `</div>`;
    $questionDisplay.append(questionHtml);

    $('#prev-question-btn').prop('disabled', currentQuestionIndex === 0);
    $('#next-question-btn').prop('disabled', currentQuestionIndex === currentQuizData.questions.length - 1);

    if (currentQuestionIndex === currentQuizData.questions.length - 1) {
        $('#submit-quiz-btn').removeClass('hidden');
        $('#next-question-btn').addClass('hidden');
    } else {
        $('#submit-quiz-btn').addClass('hidden');
        $('#next-question-btn').removeClass('hidden');
    }

    updateProgressBar();
}

/**
 * Updates the progress bar based on the current question index.
 */
function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / currentQuizData.questions.length) * 100;
    $('#quiz-progress-bar').css('width', `${progress}%`);
}

/**
 * Handles saving the user's answer for the current question.
 */
function saveUserAnswer() {
    const question = currentQuizData.questions[currentQuestionIndex];
    let answer = null;

    if (question.type === 'multiple-choice' || question.type === 'true-false') {
        answer = $(`input[name^="${question.type === 'multiple-choice' ? 'mcq-option' : 'tfq-option'}-${currentQuestionIndex}"]:checked`).val();
    } else if (question.type === 'fill-in-the-blank') {
        answer = $('#question-display input[type="text"]').val();
    }
    userAnswers[currentQuestionIndex] = answer;
}

/**
 * Checks the user's answer for the current question and updates score.
 * Provides immediate feedback.
 */
function checkAnswerAndProvideFeedback() {
    const question = currentQuizData.questions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex];
    let isCorrect = false;

    if (question.type === 'multiple-choice' || question.type === 'true-false') {
        isCorrect = (userAnswer === question.correctAnswer);
        $(`input[name^="${question.type === 'multiple-choice' ? 'mcq-option' : 'tfq-option'}-${currentQuestionIndex}"]`).each(function() {
            const $label = $(this).closest('label');
            $label.removeClass('selected-answer');
            if ($(this).val() === question.correctAnswer) {
                $label.addClass('correct-answer');
            } else if ($(this).is(':checked') && $(this).val() !== question.correctAnswer) {
                $label.addClass('incorrect-answer');
            }
            $(this).prop('disabled', true);
        });
    } else if (question.type === 'fill-in-the-blank') {
        isCorrect = (userAnswer && userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase());
        const $input = $('#question-display input[type="text"]');
        if (isCorrect) {
            $input.addClass('correct-answer border-green-400');
        } else {
            $input.addClass('incorrect-answer border-red-400');
        }
        $input.prop('disabled', true);
    }

    let currentScore = parseInt($('#quiz-score').text());
    if (isCorrect) {
        currentScore++;
    }
    $('#quiz-score').text(currentScore);
}

/**
 * Submits the quiz, calculates final score, and shows results.
 */
function submitQuiz() {
    clearInterval(quizTimerInterval);

    let finalScore = 0;
    $.each(currentQuizData.questions, function(index, question) {
        const userAnswer = userAnswers[index];
        let isCorrect = false;

        if (question.type === 'multiple-choice' || question.type === 'true-false') {
            isCorrect = (userAnswer === question.correctAnswer);
        } else if (question.type === 'fill-in-the-blank') {
            isCorrect = (userAnswer && userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase());
        }

        if (isCorrect) {
            finalScore++;
        }
    });

    showModal(`Quiz Completed! Your score: ${finalScore} out of ${currentQuizData.questions.length}`);
    $('#quiz-play-area').addClass('hidden');
    $('#quiz-list').removeClass('hidden');
}

$(document).ready(function() {
    showQuizBuilder();

    $('#show-builder-btn').on('click', showQuizBuilder);
    $('#show-taker-btn').on('click', showQuizTaker);

    $('#add-mcq-btn').on('click', function() {
        const questionId = generateUniqueId();
        const optionListId = generateUniqueId();
        const mcqHtml = `
            <div id="${questionId}" class="question-block bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm relative">
                <div class="flex items-center mb-4">
                    <span class="sortable-handle mr-3"><i data-lucide="grip-vertical" class="w-4 h-4"></i></span>
                    <h4 class="text-lg font-semibold text-gray-700 flex-grow">Multiple Choice Question</h4>
                    <button class="remove-question-btn text-red-500 hover:text-red-700 transition duration-200" title="Remove Question">
                        <i data-lucide="x-circle" class="w-6 h-6"></i>
                    </button>
                </div>
                <input type="hidden" class="question-type" value="multiple-choice">
                <div class="mb-4">
                    <label for="${questionId}-text" class="block text-gray-700 text-sm font-medium mb-2">Question Text:</label>
                    <input type="text" id="${questionId}-text" class="w-full p-2 border border-gray-300 rounded-md question-text" placeholder="e.g., What is jQuery?">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-medium mb-2">Options:</label>
                    <ul id="${optionListId}" class="space-y-2 option-list"></ul>
                    <button type="button" class="add-option-btn mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 text-sm">
                        <i data-lucide="plus" class="inline-block w-4 h-4 mr-1 align-middle"></i> Add Option
                    </button>
                </div>
                <div class="mb-4">
                    <label for="${questionId}-correct" class="block text-gray-700 text-sm font-medium mb-2">Correct Answer (select from options):</label>
                    <select id="${questionId}-correct" class="w-full p-2 border border-gray-300 rounded-md correct-answer-select">
                        <option value="">Select Correct Option</option>
                    </select>
                </div>
            </div>
        `;
        $('#questions-container').append(mcqHtml);
        lucide.createIcons();
        $(`#${optionListId}`).sortable({
            handle: '.sortable-handle',
            axis: 'y',
            placeholder: "ui-state-highlight p-2 border-dashed border-2 border-blue-300 rounded-md"
        });
    });

    $('#add-tfq-btn').on('click', function() {
        const questionId = generateUniqueId();
        const tfqHtml = `
            <div id="${questionId}" class="question-block bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm relative">
                <div class="flex items-center mb-4">
                    <span class="sortable-handle mr-3"><i data-lucide="grip-vertical" class="w-4 h-4"></i></span>
                    <h4 class="text-lg font-semibold text-gray-700 flex-grow">True/False Question</h4>
                    <button class="remove-question-btn text-red-500 hover:text-red-700 transition duration-200" title="Remove Question">
                        <i data-lucide="x-circle" class="w-6 h-6"></i>
                    </button>
                </div>
                <input type="hidden" class="question-type" value="true-false">
                <div class="mb-4">
                    <label for="${questionId}-text" class="block text-gray-700 text-sm font-medium mb-2">Question Text:</label>
                    <input type="text" id="${questionId}-text" class="w-full p-2 border border-gray-300 rounded-md question-text" placeholder="e.g., jQuery is a JavaScript library.">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-medium mb-2">Correct Answer:</label>
                    <select id="${questionId}-correct" class="w-full p-2 border border-gray-300 rounded-md correct-answer-select">
                        <option value="">Select Correct Option</option>
                        <option value="True">True</option>
                        <option value="False">False</option>
                    </select>
                </div>
            </div>
        `;
        $('#questions-container').append(tfqHtml);
        lucide.createIcons();
    });

    $('#add-fibq-btn').on('click', function() {
        const questionId = generateUniqueId();
        const fibqHtml = `
            <div id="${questionId}" class="question-block bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm relative">
                <div class="flex items-center mb-4">
                    <span class="sortable-handle mr-3"><i data-lucide="grip-vertical" class="w-4 h-4"></i></span>
                    <h4 class="text-lg font-semibold text-gray-700 flex-grow">Fill-in-the-Blank Question</h4>
                    <button class="remove-question-btn text-red-500 hover:text-red-700 transition duration-200" title="Remove Question">
                        <i data-lucide="x-circle" class="w-6 h-6"></i>
                    </button>
                </div>
                <input type="hidden" class="question-type" value="fill-in-the-blank">
                <div class="mb-4">
                    <label for="${questionId}-text" class="block text-gray-700 text-sm font-medium mb-2">Question Text:</label>
                    <input type="text" id="${questionId}-text" class="w-full p-2 border border-gray-300 rounded-md question-text" placeholder="e.g., The capital of France is ______.">
                </div>
                <div class="mb-4">
                    <label for="${questionId}-correct" class="block text-gray-700 text-sm font-medium mb-2">Correct Answer:</label>
                    <input type="text" id="${questionId}-correct" class="w-full p-2 border border-gray-300 rounded-md correct-answer-text" placeholder="e.g., Paris">
                </div>
            </div>
        `;
        $('#questions-container').append(fibqHtml);
        lucide.createIcons();
    });

    $("#questions-container").sortable({
        handle: '.sortable-handle',
        axis: 'y',
        placeholder: "ui-state-highlight bg-blue-100 border-dashed border-2 border-blue-300 rounded-md p-4 mb-4"
    });

    $('#questions-container').on('click', '.add-option-btn', function() {
        const $questionBlock = $(this).closest('.question-block');
        const $optionList = $questionBlock.find('.option-list');
        const optionId = generateUniqueId();
        const optionHtml = `
            <li class="flex items-center">
                <span class="sortable-handle mr-2"><i data-lucide="grip-vertical" class="w-3 h-3"></i></span>
                <input type="text" id="${optionId}" class="flex-grow p-2 border border-gray-300 rounded-md option-text" placeholder="Option text">
                <button type="button" class="remove-option-btn ml-2 text-red-500 hover:text-red-700 transition duration-200 text-sm" title="Remove Option">
                    <i data-lucide="minus-circle" class="w-5 h-5"></i>
                </button>
            </li>
        `;
        $optionList.append(optionHtml);
        lucide.createIcons();
    });

    $('#questions-container').on('click', '.remove-option-btn', function() {
        $(this).closest('li').remove();
        const $questionBlock = $(this).closest('.question-block');
        updateCorrectAnswerDropdown($questionBlock);
    });

    $('#questions-container').on('click', '.remove-question-btn', function() {
        $(this).closest('.question-block').remove();
    });

    $('#questions-container').on('input', '.option-text', function() {
        const $questionBlock = $(this).closest('.question-block');
        updateCorrectAnswerDropdown($questionBlock);
    });

    function updateCorrectAnswerDropdown($questionBlock) {
        const $select = $questionBlock.find('.correct-answer-select');
        const currentCorrectAnswer = $select.val();
        $select.empty().append('<option value="">Select Correct Option</option>');
        $questionBlock.find('.option-text').each(function() {
            const optionValue = $(this).val();
            if (optionValue) {
                $select.append(`<option value="${optionValue}">${optionValue}</option>`);
            }
        });
        if (currentCorrectAnswer && $select.find(`option[value="${currentCorrectAnswer}"]`).length) {
            $select.val(currentCorrectAnswer);
        }
    }

    $('#save-quiz-btn').on('click', function() {
        const quizTitle = $('#quiz-title').val().trim();
        if (!quizTitle) {
            showModal('Please enter a quiz title.');
            return;
        }

        const questions = [];
        let isValid = true;

        $('#questions-container .question-block').each(function() {
            const $this = $(this);
            const type = $this.find('.question-type').val();
            const questionText = $this.find('.question-text').val().trim();
            const correctAnswer = $this.find('.correct-answer-select').val() || $this.find('.correct-answer-text').val();

            if (!questionText) {
                showModal('Please fill in the text for all questions.');
                isValid = false;
                return false;
            }
            if (!correctAnswer) {
                showModal('Please select or enter the correct answer for all questions.');
                isValid = false;
                return false;
            }

            const question = {
                type: type,
                questionText: questionText,
                correctAnswer: correctAnswer
            };

            if (type === 'multiple-choice') {
                const options = [];
                $this.find('.option-text').each(function() {
                    const option = $(this).val().trim();
                    if (option) {
                        options.push(option);
                    }
                });
                if (options.length < 2) {
                    showModal('Multiple choice questions need at least two options.');
                    isValid = false;
                    return false;
                }
                if (!options.includes(correctAnswer)) {
                    showModal('The selected correct answer for a multiple-choice question must be one of the provided options.');
                    isValid = false;
                    return false;
                }
                question.options = options;
            }
            questions.push(question);
        });

        if (!isValid) {
            return;
        }

        if (questions.length === 0) {
            showModal('Please add at least one question to your quiz.');
            return;
        }

        const newQuiz = {
            id: generateUniqueId(),
            title: quizTitle,
            questions: questions
        };

        const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        quizzes.push(newQuiz);
        localStorage.setItem('quizzes', JSON.stringify(quizzes));

        showModal('Quiz saved successfully!');
        $('#quiz-title').val('');
        $('#questions-container').empty();
    });

    $('#quiz-list').on('click', '.start-quiz-btn', function() {
        const quizIndex = $(this).data('quiz-index');
        startQuiz(quizIndex);
    });

    $('#quiz-list').on('click', '.delete-quiz-btn', function() {
        const quizIndex = $(this).data('quiz-index');
        let quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        const quizToDelete = quizzes[quizIndex];

        if (confirm(`Are you sure you want to delete the quiz "${quizToDelete.title}"?`)) {
            quizzes.splice(quizIndex, 1);
            localStorage.setItem('quizzes', JSON.stringify(quizzes));
            showModal('Quiz deleted successfully!');
            loadAvailableQuizzes();
        }
    });

    $('#prev-question-btn').on('click', function() {
        if (currentQuestionIndex > 0) {
            saveUserAnswer();
            currentQuestionIndex--;
            displayQuestion();
        }
    });

    $('#next-question-btn').on('click', function() {
        if (currentQuestionIndex < currentQuizData.questions.length - 1) {
            saveUserAnswer();
            checkAnswerAndProvideFeedback();
            setTimeout(() => {
                currentQuestionIndex++;
                displayQuestion();
            }, 1000);
        }
    });

    $('#submit-quiz-btn').on('click', function() {
        saveUserAnswer();
        checkAnswerAndProvideFeedback();
        setTimeout(() => {
            submitQuiz();
        }, 1000);
    });

    $('#question-display').on('change', '.quiz-answer-input', function() {
        const question = currentQuizData.questions[currentQuestionIndex];
        if (question.type === 'multiple-choice' || question.type === 'true-false') {
            saveUserAnswer();
            checkAnswerAndProvideFeedback();
        }
    });

    lucide.createIcons();
});