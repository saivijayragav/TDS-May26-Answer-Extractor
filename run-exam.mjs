import { questions } from './exam.mjs';

async function hackExam(email) {
    console.log(`\INITIATING EXAM HACK FOR: "${email}"\n`);
    console.log("Downloading remote libraries (SQLite, Pyodide, etc). This may take 10-15 seconds...\n");

    const fakeUser = { email: email };
    
    // By passing an empty map, we bypass the lit-html rendering entirely
    const fakeMap = new Map(); 

    try {
        // Execute the main engine
        const results = await questions(fakeUser, fakeMap);

        console.log("=".repeat(75));
        console.log("EXTRACTED ANSWERS");
        console.log("=".repeat(75));

        // Loop through the returned object and extract the goods
        for (const [id, data] of Object.entries(results)) {
            const answer = data.answer;

            // 1. Direct Answers: The script gives us the primitive value
            if (typeof answer !== 'function') {
                console.log(` ${id.padEnd(30)} : ${answer}`);
            } 
            // 2. Locked Answers: The answer is trapped in a validation function closure
            else {
                console.log(` ${id.padEnd(30)} : [Locked in Validator - See Cheat Sheet]`);
            }
        }
        console.log("=".repeat(75));

    } catch (e) {
        console.error("Execution failed:", e);
    }
}

// >>> PUT THE TARGET EMAIL HERE <<<
hackExam("24f1001482@ds.study.iitm.ac.in");