import Papa from 'papaparse';

export const csvService = {
  /**
   * Parse CSV File to Questions Array
   * Support format:
   * Question, Option A, Option B, Option C, Option D, Correct Answer, Marks, Type
   */
  parseQuestionsCsv(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const rawRows = results.data;
            const parsedQuestions = rawRows.map((row, index) => {
              const questionText = row['Question'] || row['question'] || row['Question Text'] || `Question ${index + 1}`;
              const optA = (row['Option A'] || row['optionA'] || row['Option 1'] || '').trim();
              const optB = (row['Option B'] || row['optionB'] || row['Option 2'] || '').trim();
              const optC = (row['Option C'] || row['optionC'] || row['Option 3'] || '').trim();
              const optD = (row['Option D'] || row['optionD'] || row['Option 4'] || '').trim();

              const options = [optA, optB, optC, optD].filter(o => o.length > 0);
              
              let rawCorrect = (row['Correct Answer'] || row['correctAnswer'] || row['Answer'] || '').trim();
              let correctAnswer = rawCorrect;

              // Parse choice letter if A, B, C, D
              const upperAns = rawCorrect.toUpperCase();
              if (upperAns === 'A' || upperAns === 'OPTION A' || upperAns === '1') {
                correctAnswer = optA || options[0];
              } else if (upperAns === 'B' || upperAns === 'OPTION B' || upperAns === '2') {
                correctAnswer = optB || options[1];
              } else if (upperAns === 'C' || upperAns === 'OPTION C' || upperAns === '3') {
                correctAnswer = optC || options[2];
              } else if (upperAns === 'D' || upperAns === 'OPTION D' || upperAns === '4') {
                correctAnswer = optD || options[3];
              }

              const type = (row['Type'] || 'single').toLowerCase().includes('bool') ? 'boolean' : 'single';
              const marks = parseInt(row['Marks'] || row['marks'] || '1', 10);
              const negativeMarks = parseFloat(row['Negative Marks'] || row['negativeMarks'] || '0');

              return {
                id: `q-csv-${Date.now()}-${index}`,
                question: questionText,
                type: options.length === 2 && (options[0].toLowerCase() === 'true' || options[0].toLowerCase() === 'false') ? 'boolean' : type,
                options: options.length > 0 ? options : ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                correctAnswer: correctAnswer || (options[0] || ''),
                marks: isNaN(marks) ? 1 : marks,
                negativeMarks: isNaN(negativeMarks) ? 0 : negativeMarks,
                imageUrl: row['Image URL'] || row['imageUrl'] || ''
              };
            });

            resolve(parsedQuestions);
          } catch (err) {
            reject(new Error('Failed to parse question CSV: ' + err.message));
          }
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  },

  /**
   * Export Quiz Results to CSV and trigger browser download
   */
  exportResultsToCsv(attemptsList, quizTitle = 'Quiz_Results') {
    if (!attemptsList || attemptsList.length === 0) {
      alert('No results available to export.');
      return;
    }

    const formattedData = attemptsList.map((a, i) => ({
      'S.No': i + 1,
      'Participant Name': a.userName || 'Anonymous',
      'Mobile Number': a.userMobile || 'N/A',
      'Quiz Title': a.quizTitle || 'Quiz',
      'Score': a.score,
      'Max Score': a.maxScore,
      'Percentage (%)': `${a.percentage}%`,
      'Questions Attempted': `${a.attemptedCount}/${a.totalQuestions}`,
      'Time Taken (sec)': a.timeTakenSeconds,
      'Started At': a.startedAt,
      'Submitted At': a.submittedAt
    }));

    const csvContent = Papa.unparse(formattedData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const cleanFileName = quizTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('download', `${cleanFileName}_results_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export Registered Contestants Details to CSV
   */
  exportUsersToCsv(usersList, attemptsList = []) {
    if (!usersList || usersList.length === 0) {
      alert('No contestant records available to export.');
      return;
    }

    const formattedData = usersList.map((u, i) => {
      const userAttempts = attemptsList.filter(a => a.userId === u.uid);
      const attemptsSummary = userAttempts.map(a => `${a.quizTitle}: ${a.score}/${a.maxScore} (${a.percentage}%)`).join(' | ');

      return {
        'S.No': i + 1,
        'Full Name': u.name || 'N/A',
        'Mobile Number': u.mobile || 'N/A',
        'Year / Semester': u.year || 'S1',
        'Engineering Branch': u.branch || 'CSE',
        'Registration Date': u.createdAt ? new Date(u.createdAt).toLocaleString('en-IN') : 'N/A',
        'Quizzes Attempted Count': userAttempts.length,
        'Attempt Details & Scores': attemptsSummary || 'No attempts yet'
      };
    });

    const csvContent = Papa.unparse(formattedData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `registered_contestants_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
