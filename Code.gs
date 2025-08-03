// @ts-nocheck
// Serve the HTML form
function doGet() {
  const userProperties = PropertiesService.getUserProperties();
  const loggedInUserDesignation = userProperties.getProperty("loggedInUserDesignation");
  
  if (!loggedInUserDesignation) {
  //if (!user) {
    // Redirect to login page if no user is logged in
    return HtmlService.createHtmlOutputFromFile('Login').setTitle('MJPTBCWRS(Boys)-BOGARAM');
  }
  const pageName = getPagebyDesignation(loggedInUserDesignation); // Retrieve home page using designation
   // Serve the main page if the user is logged in
  return HtmlService.createHtmlOutputFromFile(pageName).setTitle('MJPTBCWRS(Boys)-BOGARAM');
}

function getPagebyDesignation(designation) {

  let page = "";
  // Decide which page to load based on designation
  switch (designation.toUpperCase()) {
    case "PRINCIPAL":
      page = "Home_p";
      break;
    case "ATP":
      page = "Home_atp";
      break;  
    case "TGT":
    case "PGT":
    case "JL":
      page = "Home_Teacher";
      break;
    case "LIBRARIAN":
      page = "Home_Lib";
      break;
    case "DEO":
      page = "Home_deo";
      break;
    default:
      page = "Home"; // fallback
  }
  return page;

}
var rowIndex = 3;

function servePage(pageName) {
  return HtmlService.createHtmlOutputFromFile(pageName).getContent(); // required for .write()
}


function getBase64Logo() {
  return HtmlService.createHtmlOutputFromFile("logoBase64").getContent().trim();
}


function sendApprovalRequestLetter() {
  const name = "Saibaba Panjala";
  const empId = "PSB1";
  const phone = "9948950219";
  const designation = "TGT";
  const school = "MJPTBCWRS - Bogaram";
  const recipient = "mjp.bogaram@gmail.com";
  const subject = "Request for User Account Activation";
  const today = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd-MM-yyyy");

  const signatureFileId = "1AbCDeFgHIJKLMNO123456789"; // replace with your actual file ID
  const signatureUrl = "https://drive.google.com/uc?export=view&id=" + signatureFileId;

  const template = HtmlService.createTemplateFromFile("LetterTemplate");
  template.name = name;
  template.empId = empId;
  template.phone = phone;
  template.designation = designation;
  template.school = school;
  template.date = today;
  template.signatureUrl = signatureUrl;

  const htmlContent = template.evaluate().getContent();

  const pdfBlob = Utilities.newBlob(htmlContent, "text/html", "request.html")
    .getAs("application/pdf")
    .setName("Account_Activation_Request.pdf");

  GmailApp.sendEmail(recipient, subject, "Please find attached my account activation request letter.", {
    attachments: [pdfBlob],
    name: name
  });

  Logger.log("✅ Email sent with signature.");
}
function sendApprovedLetterToUser() {
  const name = "Saibaba Panjala";
  const empId = "PSB1";
  const phone = "9948950219";
  const designation = "TGT";
  const school = "MJPTBCWRS - Bogaram";
  const recipient = "saibaba.panjala1982@gmail.com";
  const subject = "Your Account Has Been Approved – Signed Letter Attached";
  const today = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd-MM-yyyy");

  const userSignatureId = "your_user_signature_id";
  const principalSignatureId = "your_principal_signature_id";

  const userSignatureUrl = "https://drive.google.com/uc?export=view&id=" + userSignatureId;
  const principalSignatureUrl = "https://drive.google.com/uc?export=view&id=" + principalSignatureId;

  const logoBase64 = getBase64Logo();

  const template = HtmlService.createTemplateFromFile("LetterTemplate");

  template.name = name;
  template.empId = empId;
  template.phone = phone;
  template.designation = designation;
  template.school = school;
  template.date = today;
  template.signatureUrl = userSignatureUrl;
  template.showPrincipalSignature = true;
  template.principalSignatureUrl = principalSignatureUrl;
  template.logoUrl = logoBase64;
  template.watermarkUrl = logoBase64; // optional

  const htmlContent = template.evaluate().getContent();

  const pdfBlob = Utilities.newBlob(htmlContent, "text/html", "approved_letter.html")
    .getAs("application/pdf")
    .setName("Account_Activation_Approval_Letter.pdf");

  GmailApp.sendEmail(recipient, subject, "Please find attached the approval letter signed by the Principal.", {
    attachments: [pdfBlob],
    name: "MJPTBCWRS - Bogaram"
  });

  Logger.log("✅ Approved letter sent to: " + recipient);
}



function registerUser(name, gender, phone, username, password, empid, desig, empcode) {
  const recipient = "mjp.bogaram@gmail.com"
  const subject = "Account Creation Request"
  const message = "Please approve my request for creating account"
  const sheet = SpreadsheetApp.openById("1wv2MNRuzurGYF5dlTwTRZK_b3QG3SSzFuax8RVUw2tY").getSheetByName("Users");
  const data = sheet.getDataRange().getValues();
  const hashedPassword = hashPassword(password);
  // Check if user already exists
  for (let i = 3; i < data.length; i++) {
    if (data[i][1] === username) {
      return "User already exists.";
    }
  }

  const sn = (data.length - rowIndex) +1;
  const email = Session.getActiveUser().getEmail();

  // Add new user
  sheet.appendRow([sn, username, hashedPassword, name, gender, empid, desig, phone, "Pending", password, , empcode, , email]);
  //sendEmail(recipient, subject, message);
  sendApprovalRequestLetter();
  
  


  return "success";
}

function hashPassword(password) {
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  return raw.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function validateLogin(user, password) {
 
  const data = getTeachersData();
  const hashedPassword = hashPassword(password);
  for (let i = 3; i < data.length; i++) { // Skip the header row (assuming it's the first row)
    if (data[i][1] === user && data[i][2] === hashedPassword) {
      if (data[i][8] === "Approved") {
        const userName = data[i][3];
        const gender = data[i][4];
        const empId = data[i][5];
        const designation = data[i][6];
        const phoneNumber = data[i][7];
        const imageUrl = data[i][10]; 
        //const houseMaster = data[i][7];
        const teacherCode = data[i][11];

        // Store user details in UserProperties
        const userProperties = PropertiesService.getUserProperties();
        userProperties.setProperty('loggedInUser', user); // Store user ID
        userProperties.setProperty('loggedInUserName', userName); // Store name
        userProperties.setProperty('loggedInGender', gender); // Store gender
        userProperties.setProperty('loggedInUserId', empId); // Store employee ID
        userProperties.setProperty('loggedInUserDesignation', designation); // Store designation
        userProperties.setProperty('loggedInUserPhone', phoneNumber);
        userProperties.setProperty('loggedInUserImage', imageUrl);
        //userProperties.setProperty('loggedInhouseMaster', houseMaster);
        userProperties.setProperty('loggedInteacherCode', teacherCode);
        const page = getPagebyDesignation(designation);

        return page; // assuming column E contains designation (e.g., TGT, PGT, JL, DEO)
      } else if (data[i][8] === "Rejected") {
        return "Rejected";
      } else {
        return "Pending";
      }
      
    }
  }

  return "invalid";
}
function getSessionUser() {
  const userProperties = PropertiesService.getUserProperties();
  const user = userProperties.getProperty('loggedInUser');
  const userId = userProperties.getProperty('loggedInUserId');
  const userName = userProperties.getProperty('loggedInUserName');
  const gender = userProperties.getProperty('loggedInGender');
  const designation = userProperties.getProperty('loggedInUserDesignation');
  const imageUrl = userProperties.getProperty('loggedInUserImage');
  const houseMaster = userProperties.getProperty('loggedInhouseMaster');
  const teacherCode = userProperties.getProperty('loggedInteacherCode');
 
  console.log({ user, userId, userName, designation }); // Debug log

  const sessionData = {
    user: user || null,
    userId: userId || null,
    userName: userName || null,
    gender: gender || null,
    designation: designation || null,
    imageUrl: imageUrl || null,
    houseMaster: houseMaster || null,
    teacherCode: teacherCode || null,
   
  };
  console.log('Session Data:', sessionData); // Log for debugging
  return sessionData;

  
}

function getTableData(sheetName) {
  const ss = SpreadsheetApp.openById('1wv2MNRuzurGYF5dlTwTRZK_b3QG3SSzFuax8RVUw2tY');
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { headers: [], rows: [] };

  const data = sheet.getDataRange().getValues();
  const headers = data[2]; // Row 3 (0-indexed)

  const rows = [];
  for (let i = 3; i < data.length; i++) { // From row 4 in sheet
    const row = data[i];
    if (row.some(cell => cell !== "" && cell !== null && cell !== undefined)) {
      rows.push({ rowData: row, rowNumber: i + 1 }); // rowNumber is actual row in sheet
    }
  }

  return { headers, rows };
}
function approvals(sheetName, rowNumber, status, remarks) {
  if (sheetName == "Users") {
    approveUsers(sheetName, rowNumber, status, remarks);
  } else if (sheetName == "CLs") {
    approveLeaves(sheetName, rowNumber, status, remarks);
  }

}

function approveUsers(sheetName, rowIndex, status, remarks) {
  const ss = SpreadsheetApp.openById('1wv2MNRuzurGYF5dlTwTRZK_b3QG3SSzFuax8RVUw2tY');
  const sheet = ss.getSheetByName(sheetName);
  const headers = sheet.getRange(3, 1, 1, sheet.getLastColumn()).getValues()[0];
  const statusCol = headers.indexOf("STATUS") + 1;
  const mailCol = headers.indexOf("MAIL_ID") + 1;
  const remarksCol = headers.indexOf("REMARKS") + 1;

  if (statusCol === 0) throw new Error("STATUS column not found.");
  if (mailCol === 0) throw new Error("MAIL_ID column not found.");

  // Approve the request
  sheet.getRange(rowIndex, statusCol).setValue(status);

  // ✅ Update REMARKS
  sheet.getRange(rowIndex, remarksCol).setValue(remarks);

  // Get row data
  const rowData = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  Logger.log("RowData: " + JSON.stringify(rowData));

  // Send to profile creator
  try {
    teacherProfiles(rowData);
  } catch (e) {
    Logger.log("Error in teacherProfiles: " + e.message);
  }

  // Send email
  const recipient = sheet.getRange(rowIndex, mailCol).getValue();
  Logger.log("Recipient: " + recipient);
  Logger.log("Recipient: " + statusCol);
  Logger.log("Recipient: " + mailCol);
  const subject = "Approval Confirmation";
  const message = "Your request got approval";

  try {
    sendEmail(recipient, subject, message);
  } catch (e) {
    Logger.log("Error sending email: " + e.message);
  }
}
function teacherProfiles(rowData) {
  try {
    Logger.log("🚀 Starting Leave Profile creation...");
    createProfiles(
      "1oFBQ52aRqEbtRmMb5yxiXtQCn0N-SXfk0f5Xr__XVFQ", 
      "LeaveProfileTemplate", 
      rowData
    );
    Logger.log("✅ Leave Profile created.");
  } catch (e) {
    Logger.log("❌ Error creating Leave Profile: " + e.message);
  }

  try {
    Logger.log("🚀 Starting Permissions Profile creation...");
    createProfiles(
      "1aWdSFj95e3kky4Gg_YItp6JZGsEW2041LYc2HtB7wJs", 
      "PermissionsProfileTemplate", 
      rowData
    );
    Logger.log("✅ Permissions Profile created.");
  } catch (e) {
    Logger.log("❌ Error creating Permissions Profile: " + e.message);
  }
}


//function teacherProfiles(rowData) {
//  var leaveProfileId = "1oFBQ52aRqEbtRmMb5yxiXtQCn0N-SXfk0f5Xr__XVFQ";
//  var lptemplateSheetName = 'LeaveProfileTemplate'; // Name of the template sheet
//  var permissionProfileId = "1aWdSFj95e3kky4Gg_YItp6JZGsEW2041LYc2HtB7wJs";
//  var pptemplateSheetName = 'PermissionsProfileTemplate'; // Name of the template sheet
//  createProfiles(leaveProfileId, lptemplateSheetName, rowData);
//  createProfiles(permissionProfileId, pptemplateSheetName, rowData);
//}

function createProfiles(id, templateSheetName, rowData) {
  const empCode = rowData[11];
  const empCodeSafe = empCode?.replace(/[\/\\\?\*\[\]\:]/g, '_').substring(0, 100) || "UNKNOWN";

  const ss = SpreadsheetApp.openById(id);
  const templateSheet = ss.getSheetByName(templateSheetName);

  Logger.log("🆔 Target Spreadsheet: " + id);
  Logger.log("📄 Template Sheet Name: " + templateSheetName);
  Logger.log("🔢 Sheet count: " + ss.getSheets().length);
  Logger.log("🙈 Is template hidden: " + templateSheet.isSheetHidden());
  Logger.log("🔒 Protections count: " + templateSheet.getProtections(SpreadsheetApp.ProtectionType.SHEET).length);

  if (!templateSheet) {
    throw new Error("Template sheet not found.");
  }

  const alreadyExists = ss.getSheets().some(s => s.getName() === empCodeSafe);
  if (alreadyExists) {
    Logger.log("⚠️ Sheet already exists: " + empCodeSafe);
    return;
  }

  try {
    const newSheet = templateSheet.copyTo(ss);
    SpreadsheetApp.flush();
    Utilities.sleep(300);
    newSheet.setName(empCodeSafe);
    Logger.log("✅ Sheet copied and renamed: " + empCodeSafe);
  } catch (e) {
    Logger.log("❌ copyTo/setName failed: " + e.message);
  }
}



//function createProfiles(id, templateSheetName, rowData) {
//  const empName = rowData[3];  // Column D
//  const empGender = rowData[4];     
//  const empId = rowData[5];
//  const empDesig = rowData[6];
//  const empPhone = rowData[7];
//  const empCode = rowData[11];
//  const empGmail = rowData[13];
//  var totalCls;
//  if (empGender == "MALE") {
//    totalCls = 20;
//  } else {
//    totalCls = 25;
//  }
//  var ss = SpreadsheetApp.openById(id);
//  var sheetExists = ss.getSheets().some(sheet => sheet.getName() === empCode);
//  if (!sheetExists) {
//    var templateSheet = ss.getSheetByName(templateSheetName);
//    var newSheet = templateSheet.copyTo(ss);
//    newSheet.setName(empCode);
//  } 
//  
//}
//
/// create exam
/**
 * Server-side function to create exam folder structure and student sheets.
 * @param {Object} examData - Contains examName, classValue, and columns [{name, maxMarks}]
 */
/**
 * Creates exam structure: creates folders (if not exists), copies template, appends exam columns.
 * Triggered from HTML modal form.
 */
function createExamStructure(examData) {
  const { examName, classValue, columns } = examData;
  const parentFolderId = '1aLeNcZTMbFnw3LvIrgIWBnuk79JnjL7h'; // Parent folder ID
  //const templateId = '19kzwtz0EJaaA96Qs3Mc0IibU304TbJAtvUrBkAKsVvQ'; // Template file ID  1z1kO8nlMrYmrcHXfuMUxIYCa7_PzZNNeylGQ2w7V1vE
  const templateId = '1XzNDpv2GHrZZUkeAUh3zEHOKs8kJDQZw9wt6oxytGE4';
  const summarySheetId = '16ckIgZ0TQEKbbXQGR7idW6scRj3adbsn4y0D4PJm8Ho'; // Summary sheet ID

  const sectionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const subjects = ['TELUGU', 'HINDI', 'ENGLISH', 'MATHS', 'SCIENCE', 'SOCIAL'];
  const classFolderName = `Class-${classValue}`;

  const parentFolder = DriveApp.getFolderById(parentFolderId);
  const classFolders = parentFolder.getFoldersByName(classFolderName);
  const classFolder = classFolders.hasNext() ? classFolders.next() : parentFolder.createFolder(classFolderName);

  const examIdsSheet = SpreadsheetApp.openById(summarySheetId).getSheetByName('ExamIds');
  let examIdsRowIndex = examIdsSheet.getLastRow() + 1;
  const examSummarySheet = SpreadsheetApp.openById(summarySheetId).getSheetByName('examSummary');
  let examSummaryIndex = examSummarySheet.getLastRow() + 1;

  sectionLetters.forEach(section => {
    const sectionFolder = classFolder.getFoldersByName(section).hasNext()
      ? classFolder.getFoldersByName(section).next()
      : classFolder.createFolder(section);

      
    const tempSheetName = `CLASS${classValue}-${section}`;
    const templateSpreadsheet = SpreadsheetApp.openById(templateId);
    //const allTemplateSheets = templateSpreadsheet.getSheets();
    //const classSectionKey = `class${classValue}${section}`.toLowerCase().replace(/\s+/g, '');
//
    //let tempSheetName = null;
//
    //for (let s of allTemplateSheets) {
    //  const cleanedName = s.getName().toLowerCase().replace(/[\s\-]+/g, ''); // Remove spaces and dashes
    //  if (cleanedName.includes(classSectionKey)) {
    //    tempSheetName = s;
    //    break;
    //  }
    //}

    if (!tempSheetName) {
      Logger.log(`❌ No matching template sheet found for: ${classValue}-${section}`);
      return;
    }

    
    const baseSheet = templateSpreadsheet.getSheetByName(tempSheetName);
    if (!baseSheet) {
      Logger.log(`Template sheet not found: ${tempSheetName}`);
      return;
    }

    // ✅ Create only one file per section
    const newFileName = `${examName}`;
    // 🔍 Check if file already exists
    const existingFiles = sectionFolder.getFilesByName(newFileName);
    if (existingFiles.hasNext()) {
      throw new Error(`❌ File "${newFileName}" already exists in folder ${classValue}-${section}`);
    }
    const newSpreadsheet = SpreadsheetApp.create(newFileName);

    
    subjects.forEach(subject => {
      const copiedSheet = baseSheet.copyTo(newSpreadsheet);
      copiedSheet.setName(subject);

      const sourceSheet = copiedSheet;
      const allData = sourceSheet.getDataRange().getValues();

      const rollIndex = 0, uidIndex = 1, nameIndex = 2;
      const headerRowIndex = 3;
      const dataStartIndex = 4;

      const originalHeaders = allData[headerRowIndex];
      const newHeaders = [
        ...originalHeaders.slice(0, 3),
        ...columns.map(col => `${col.name} (${col.maxMarks})`),
        'TOTAL', 'GRADE', 'GPA'
      ];

      const preservedTopRows = allData.slice(0, 3);
      const studentRows = allData.slice(dataStartIndex).map(row => [
        row[rollIndex],
        row[uidIndex],
        row[nameIndex],
        ...Array(columns.length + 3).fill('')
      ]);

      const finalData = [newHeaders, ...studentRows];

      sourceSheet.getRange(4, 1, finalData.length, finalData[0].length).setValues(finalData);
    });
    // 📌 Remove the default "Sheet1"
    const defaultSheet = newSpreadsheet.getSheets()[0];
    newSpreadsheet.deleteSheet(defaultSheet);

    const newFile = DriveApp.getFileById(newSpreadsheet.getId());
    sectionFolder.addFile(newFile);
    DriveApp.getRootFolder().removeFile(newFile);

    // ✅ Log only one entry per section
    examIdsSheet.getRange(examIdsRowIndex++, 1, 1, 5).setValues([
      [examName, classValue, section, newFile.getId(), newFile.getUrl()]
    ]);
  });

  // ✅ Log exam summary once per run
  examSummarySheet.getRange(examSummaryIndex++, 1, 1, 2).setValues([
    [examName, classValue]
  ]);
}





//function createExamStructure(examData) {
//  const parentFolderId = '1aLeNcZTMbFnw3LvIrgIWBnuk79JnjL7h'; // Where all class folders are stored
//  const templateId = '19kzwtz0EJaaA96Qs3Mc0IibU304TbJAtvUrBkAKsVvQ'; // Your base template
//
//  const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
//  const className = examData.classValue;
//  const examName = examData.examName;
//  const columns = examData.columns; // [{ name: "Sliptest", maxMarks: 10 }, ...]
//
//  const parentFolder = DriveApp.getFolderById(parentFolderId);
//  const classFolder = parentFolder.createFolder(className);
//
//  const sheetIds = [];
//
//  sections.forEach(section => {
//    const sectionFolder = classFolder.createFolder(section);
//    const newFileName = `${examName}`;
//    const copiedFile = DriveApp.getFileById(templateId).makeCopy(newFileName, sectionFolder);
//    const newSheet = SpreadsheetApp.openById(copiedFile.getId());
//
//    // Prepare header row
//    const headers = ['ROLL NO', 'UID', 'NAME'];
//    columns.forEach(col => headers.push(`${col.name} (${col.maxMarks})`));
//    headers.push('TOTAL', 'GRADE', 'GPA');
//
//    const sheet = newSheet.getSheets()[0];
//    sheet.clearContents();
//    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
//
//    // Optional: set column widths, styles etc.
//
//    // Log to summary
//    sheetIds.push({
//      class: className,
//      section: section,
//      exam: examName,
//      fileId: copiedFile.getId(),
//      fileUrl: newSheet.getUrl()
//    });
//  });
//
//  // Save all generated file info to index sheet
//  writeToIndexSheet(sheetIds);
//}
//
//function writeToIndexSheet(entries) {
//  const ss = SpreadsheetApp.openById('16ckIgZ0TQEKbbXQGR7idW6scRj3adbsn4y0D4PJm8Ho');
//  const sheet = ss.getSheetByName('ExamIndex');
//
//  entries.forEach(entry => {
//    sheet.appendRow([
//      new Date(),
//      entry.exam,
//      entry.class,
//      entry.section,
//      entry.fileId,
//      entry.fileUrl
//    ]);
//  });
//}
//////////////

function approveLeaves(sheetName, rowNumber, status, remarks) {
  const ss = SpreadsheetApp.openById('1wv2MNRuzurGYF5dlTwTRZK_b3QG3SSzFuax8RVUw2tY');
  const sheet = ss.getSheetByName(sheetName);
  const headers = sheet.getRange(3, 1, 1, sheet.getLastColumn()).getValues()[0];

  const statusCol = headers.indexOf("STATUS") + 1;
  const remarksCol = headers.indexOf("REMARKS") + 1;

  if (statusCol > 0) sheet.getRange(rowNumber, statusCol).setValue(status);
  if (remarks && remarksCol > 0) sheet.getRange(rowNumber, remarksCol).setValue(remarks);
}




function getTeachersInfo() {
  const teachersInfo = getTeachersData();
  if (!teachersInfo || teachersInfo.length < 4) {
    Logger.log("No teacher data found or data too short: " + JSON.stringify(teachersInfo));
    return null;
  }

  const headers = teachersInfo[2]; // Row 3 = index 2
  const statusIndex = headers.indexOf("STATUS");
  if (statusIndex === -1) {
    Logger.log("ACCOUNT STATUS column not found.");
    return null;
  }

  // Filter approved rows and add S.No
  const filteredData = teachersInfo.slice(3) // From row 4 onward
    .filter(row => row[statusIndex] === "Approved")
    .map((row, index) => [
      index + 1,        // S.No (1-based)
     
      row[3],           // Column D
      row[5],           // Column E
      row[6],           // Column F
      row[7],           // Column G
      row[11]           // Column K
    ]);

  const teachersData = {
    headers: ["S.No",headers[3], headers[5], headers[6], headers[7], headers[11]],
    rows: filteredData,
  };

  return teachersData;
}



function getTeachersData() {
  const sheetId = '1wv2MNRuzurGYF5dlTwTRZK_b3QG3SSzFuax8RVUw2tY'; // Replace with your Google Sheet ID
  const sheetName = 'Users'; // Replace with the sheet name containing user credentials
  const ss = SpreadsheetApp.openById(sheetId);
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return false; // Sheet not found
  }

  const data = sheet.getDataRange().getValues(); // Fetch all data from the sheet

  return data;
}

function clearSession() {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.deleteAllProperties();
}

function sendEmail(to, subject, message) {
  GmailApp.sendEmail(to, subject, message);
}

function logout() {
  clearSession();
  
  return HtmlService.createHtmlOutputFromFile('Login').getContent();
}
//function testCopy() {
//  const ss = SpreadsheetApp.openById("1oFBQ52aRqEbtRmMb5yxiXtQCn0N-SXfk0f5Xr__XVFQ");
//  const sheet = ss.getSheetByName("LeaveProfileTemplate");
//  const copy = sheet.copyTo(ss);
//  copy.setName("TEST_COPY_" + new Date().getTime());
//}
//
//function testGeneratePdfWithLogo() {
//  const logo = getBase64Logo();
//
//  const html = `
//    <html>
//      <body style="font-family: Arial, sans-serif;">
//        <div style="text-align: center;">
//          <img src="${logo}" width="120"><br>
//          <h2>MJPTBCWRS - Bogaram</h2>
//          <p>This is a test PDF with school logo at the top.</p>
//        </div>
//      </body>
//    </html>
//  `;
//
//  const blob = Utilities.newBlob(html, "text/html").getAs("application/pdf");
//  blob.setName("Logo_Test.pdf");
//
//  // Save to Drive for preview instead of email
//  DriveApp.createFile(blob);
//}
//
function testOpenSheet() {
  const sheet = SpreadsheetApp.openById('1vaW13JbWSOnN8HvkDfLtDTDHFkgXaFCv');
  Logger.log(sheet.getName());
}
