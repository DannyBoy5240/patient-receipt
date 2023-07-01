const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mysql = require("mysql");
const multer = require("multer");
const resolvePath = require('path').resolve;
const fs = require('fs');
const app = express();
const path = require('path');

app.use(cors());
app.use(bodyParser.json());

const upload = multer({ dest: "uploads/" });

// MySQL Configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Dannyboy0524!",
  database: "patientsystem",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database!");
});

app.use(express.static(resolvePath(__dirname, '../build')));
app.get('*', (req, res) => {
  const contents = fs.readFileSync(
    resolvePath(__dirname, '../build/index.html'),
    'utf8',
  )
  res.send(contents)
})

// Able to Access and Get Image
app.use("/api/uploads", express.static(path.join(__dirname, 'uploads')));

// ----------------------------- user authentication - login/signup/password reset ---------------------------------
app.post("/api/login", (req, res) => {
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [req.body.currentEmail],
    (err, rows) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        const user = rows[0];
        if (!user) {
          res
            .status(400)
            .json({ auth: false, message: "No users found in the database" });
        } else {
          if (req.body.currentPassword == user.password) {
            // Password is correct, generate a token
            const secretKey = crypto.randomBytes(32).toString("hex");
            const token = jwt.sign({ user: user }, secretKey, {
              expiresIn: "30m",
            });
            res.status(200).json({
              auth: true,
              message: "User found succeed",
              token: token,
            });
          } else
            res
              .status(400)
              .json({ auth: false, message: "Incorrect password" });
        }
      }
    }
  );
});

// Generate a JWT token for password reset
function generateResetToken(email) {
  return jwt.sign({ email }, "secret-key", { expiresIn: "1h" });
}

// Send password reset email
async function sendPasswordResetEmail(email, token) {
  try {
    const transporter = nodemailer.createTransport({
      // Configure the email transporter (e.g., Gmail, SMTP server)
      // ...
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "ngyentuandev@gmail.com",
        pass: "flztqkcsxpgxgdtc",
      },
    });
  
    const mailOptions = {
      from: "info@doctor.com",
      to: email,
      subject: "Password Reset",
      text: `Click the following link to reset your password: http://95.216.251.189:3000/resetpassword/${token}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.messageId);
  } catch (error) {
    console.error("Error sending password reset email : ", error);
  }
}

// API endpoint for password reset request
app.post("/api/resetpassword", (req, res) => {
  const { resetEmail } = req.body;
  if (!resetEmail) {
    return res.status(400).json({ message: "Email is required" });
  }
  db.query("SELECT * FROM users WHERE email = ?", [resetEmail], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      if (rows.length == 0) {
        return res
          .status(400)
          .json({ message: "No Verified Email not found!", status: false });
      } else {
        const token = generateResetToken(resetEmail);
        // user.resetToken = token;
        sendPasswordResetEmail(resetEmail, token);

        res
          .status(200)
          .json({ message: "Password reset email sent", status: true });
      }
    }
  });
});

// API endpoint for password update
app.post("/api/updatemailpassword", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email, and password are required" });
  }

  db.query(
    `UPDATE users SET password = ? WHERE email = ?`,
    [password, email],
    (err, rows) => {
      if (err) {
        res.status(500).json({message: err.message});
      } else {
        res.status(200).json({message: "Email Reset Password Successfully!"});
      }
    }
  )
});

// -----------------------------------------------------------------------------------------------------

// get patient cards
app.post("/api/getptcards", (req, res) => {
  const { doctorID, curDate } = req.body;
  db.query(
    "SELECT pt_cards.*, patients.* FROM pt_cards JOIN patients ON pt_cards.patientid = patients.patientid WHERE pt_cards.doctorid = ?",
    [doctorID],
    (err, rows) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.status(200).json({ data: rows });
      }
    }
  );
});

// get patient cards by date
app.post("/api/getptcardsbydate", (req, res) => {
  // const { doctorID, viewDate } = req.body;
  // if (doctorID && doctorID != undefined && viewDate && viewDate != undefined) {
  //   db.query(
  //     "SELECT pt_cards.*, patients.* FROM pt_cards JOIN patients ON pt_cards.patientid = patients.patientid WHERE pt_cards.doctorid = ? AND pt_cards.date LIKE CONCAT('%', ?, '%')",
  //     [doctorID, viewDate],
  //     (err, rows) => {
  //       if (err) {
  //         res.status(500).send(err.message);
  //       } else {
  //         res.status(200).json({ data: rows });
  //       }
  //     }
  //   );
  // }
  const { doctorID } = req.body;
  if (doctorID && doctorID != undefined) {
    db.query(
      "SELECT pt_cards.*, patients.* FROM pt_cards JOIN patients ON pt_cards.patientid = patients.patientid WHERE pt_cards.doctorid = ?",
      [doctorID],
      (err, rows) => {
        if (err) {
          res.status(500).send(err.message);
        } else {
          res.status(200).json({ data: rows });
        }
      }
    );
  }
});

// get patient card by patient ID for alubm
app.post("/api/getptcardbypatientid", (req, res) => {
  const patientID = req.body.patientID;

  db.query(
    `SELECT * from pt_cards WHERE patientid = ?`,
    [patientID],
    (err, rows) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.status(200).json({ data: rows });
      }
    }
  );
});

// remove selected album image
app.post("/api/removealbumimage", (req, res) => {
  const { cardID, rmImgName } = req.body;
  const rmImgNameStr = ", " + rmImgName;

  db.query(
    `UPDATE pt_cards SET album = REPLACE(album, ?, '') WHERE album LIKE CONCAT('%', ?, '%') AND cardid = ?`,
    [rmImgNameStr, rmImgNameStr, cardID],
    (err, rows) => {
      if (err) {
        res
          .status(500)
          .json({ message: "remove album image failed!" + err.message });
      } else {
        res.status(200).json({ message: "remove album image successfully!" });
      }
    }
  );
});

// get patient history
app.post("/api/getpthistory", (req, res) => {
  const { patientID, doctorID } = req.body;
  if (doctorID == "") {
    db.query(
      "SELECT * FROM pt_history WHERE id = ?",
      [patientID],
      (err, rows) => {
        if (err) {
          res.status(500).send(err.message);
        } else {
          res.status(200).json({ data: rows });
        }
      }
    );
  } else {
    db.query(
      "SELECT * FROM pt_history WHERE id = ? AND doctorid = ?",
      [patientID, doctorID],
      (err, rows) => {
        if (err) {
          res.status(500).send(err.message);
        } else {
          res.status(200).json({ data: rows });
        }
      }
    );
  }
});

// update patient card patient history
app.post("/api/updateptcardpasthistory", (req, res) => {
  // const { cardid, historydata, historydate } = req.body;
  // // update on DB
  // db.query(
  //   `UPDATE pt_cards SET pasthistory = ?, pasthistorydate = ? WHERE cardid = ?`,
  //   [historydata, historydate, cardid],
  //   (err, rows) => {
  //     if (err) {
  //       res
  //         .status(500)
  //         .json({ message: "Update patient history failed!" + err.message });
  //     } else {
  //       res
  //         .status(200)
  //         .json({ message: "Update patient history successfully!" });
  //     }
  //   }
  // );

  const { patientid, historydata, historydate } = req.body;
  // update on DB
  db.query(
    `UPDATE patients SET pasthistory = ?, pasthistorydate = ? WHERE patientid = ?`,
    [historydata, historydate, patientid],
    (err, rows) => {
      if (err) {
        res
          .status(500)
          .json({ message: "Update patient history failed!" + err.message });
      } else {
        res
          .status(200)
          .json({ message: "Update patient history successfully!" });
      }
    }
  );
});

// add new and update patient
app.post("/api/updatepatient", (req, res) => {
  const { newPatient, mode, oldPatientID } = req.body;

  const formattedBirthday = new Date(newPatient.birthday)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  if (mode == 1) {
    const sql = `INSERT INTO patients (name, engname, birthday, sex, patientid, telephone, address, emergency, emergencynumber) VALUES (?, ?, DATE_FORMAT(?, "%Y-%m-%d %H:%i:%s"), ?, ?, ?, ?, ?, ?)`;
    const values = [
      newPatient.chiname,
      newPatient.engname,
      formattedBirthday,
      newPatient.sex == "男" ? "1" : "0",
      newPatient.patientid,
      newPatient.telephone,
      newPatient.address,
      newPatient.emergency,
      newPatient.emergencynumber,
    ];
  
    // Execute the query
    db.query(sql, values, (err, result) => {
      if (err) {
        res.status(200).json({ message: "Error updating patient: " + err });
      } else {
        res.status(200).json({ message: "patient updating successfully!" });
      }
    });
  }
  else if (mode == 2 || mode == 3) {
    const sql = `UPDATE patients SET name = ?, engname = ?, birthday = ?, sex = ?, patientid = ?, telephone = ?, address = ?, emergency = ?, emergencynumber = ? WHERE patientid = ?`;
    const values = [
      newPatient.chiname,
      newPatient.engname,
      formattedBirthday,
      newPatient.sex == "男" ? "1" : "0",
      newPatient.patientid,
      newPatient.telephone,
      newPatient.address,
      newPatient.emergency,
      newPatient.emergencynumber,
      oldPatientID,
    ];
  
    // Execute the query
    db.query(sql, values, (err, result) => {
      if (err) {
        res.status(200).json({ message: "Error updating patient: " + err });
      } else {
        res.status(200).json({ message: "patient updating successfully!" });
      }
    });
  }

  // const {
  //   chiname,
  //   engname,
  //   birthday,
  //   sex,
  //   patientid,
  //   telephone,
  //   address,
  //   emergency,
  //   emergencynumber,
  // } = req.body;

  // const formattedBirthday = new Date(birthday)
  //   .toISOString()
  //   .slice(0, 19)
  //   .replace("T", " ");

  // const sql = `INSERT INTO patients (name, engname, birthday, sex, patientid, telephone, address, emergency, emergencynumber) VALUES (?, ?, DATE_FORMAT(?, "%Y-%m-%d %H:%i:%s"), ?, ?, ?, ?, ?, ?)`;

  // const values = [
  //   chiname,
  //   engname,
  //   formattedBirthday,
  //   sex == "男" ? "1" : "0",
  //   patientid,
  //   telephone,
  //   address,
  //   emergency,
  //   emergencynumber,
  // ];

  // // Execute the query
  // db.query(sql, values, (err, result) => {
  //   if (err) {
  //     res.status(200).json({ message: "Error adding patient: " + err });
  //   } else {
  //     res.status(200).json({ message: "patient added successfully!" });
  //   }
  // });
});

// update last patient history
app.post("/api/updatelastpthistory", (req, res) => {
  const { cardID, originPtHistory, newPtHistory } = req.body;

  const sql = `UPDATE pt_history SET detail = ? WHERE id = ? AND detail = ?`;

  const values = [newPtHistory, cardID, originPtHistory];

  // Execute the query
  db.query(sql, values, (err, result) => {
    if (err) {
      res
        .status(500)
        .json({ message: "Error updating last patient history : " + err });
    } else {
      res
        .status(200)
        .json({ message: "last patient history updated successfully!" });
    }
  });
});

// ------------------------------------------- Account Management ----------------------------------------------------

// get account lists
app.post("/api/getaccounts", (req, res) => {
  const sql = "SELECT * from users";

  db.query(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ message: "Error loading account list : " + err });
    } else {
      res.status(200).json({
        message: "Loading account list successfully!",
        list: rows,
      });
    }
  });
});

app.post("/api/getaccountbyemail", (req, res) => {

  const email = req.body.email;

  const sql = "SELECT * from users WHERE email = ?";

  db.query(sql, [email], (err, rows) => {
    if (err) {
      res.status(500).json({ message: "Error loading account : " + err });
    } else {
      res.status(200).json({
        message: "Loading account list successfully!",
        data: rows,
      });
    }
  });
});

// get company profile information
app.post("/api/getcompanyinfo", (req, res) => {
  const sql = "SELECT * from company";

  db.query(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ message: "Error loading company info : " + err });
    } else {
      res.status(200).json({
        message: "Loading Company Profile successfully!",
        data: rows,
      });
    }
  });
});

// update company profile information
app.post("/api/updatecompanyprofile", (req, res) => {
  const { companyLogo, companyAddress, companyTelephone } = req.body;

  const sql = "UPDATE company SET logo = ?, address = ?, tel = ? WHERE id = 1";
  const values = [companyLogo, companyAddress, companyTelephone];

  db.query(sql, values, (err, rows) => {
    if (err) {
      res.status(500).json({ message: "Error updating company info : " + err });
    } else {
      res.status(200).json({
        message: "Updating Company Profile successfully!",
      });
    }
  });
});

// add new account
app.post("/api/addaccount", (req, res) => {
  const { userAvatar, userName, userEmail, password, fullName, doctorID } =
    req.body;

  const sql = `INSERT INTO users (email, username, fullname, doctorid, avatar, password) VALUES (?, ?, ?, ?, ?, ?)`;

  const values = [
    userEmail,
    userName,
    fullName,
    doctorID,
    userAvatar,
    password,
  ];

  // Execute the query
  db.query(sql, values, (err, result) => {
    if (err) {
      res.status(500).json({ message: "Error adding new account : " + err });
    } else {
      res.status(200).json({ message: "Adding New Account Successfully!" });
    }
  });
});

// update profile account
app.post("/api/updateaccount", (req, res) => {
  const {
    context,
    userAvatar,
    userName,
    userEmail,
    password,
    fullName,
    doctorID,
  } = req.body;

  const sql = `UPDATE users SET email = ?, username = ?, fullname = ?, doctorid = ?, avatar = ?, password = ? WHERE email = ?`;

  const values = [
    userEmail,
    userName,
    fullName,
    doctorID,
    userAvatar,
    password,
    context.email,
  ];

  // Execute the query
  db.query(sql, values, (err, result) => {
    if (err) {
      res.status(500).json({ message: "Error updating account : " + err });
    } else {
      res.status(200).json({ message: "Updating Account Successfully!" });
    }
  });
});

// delete account
app.post("/api/deleteaccount", (req, res) => {
  const email = req.body.email;

  const sql = `DELETE FROM users WHERE email = ?`;

  const values = [email];
  // Execute the query
  db.query(sql, values, (err, result) => {
    if (err) {
      res.status(500).json({ message: "Error deleting account : " + err });
    } else {
      res.status(200).json({ message: "Deleting Account Successfully!" });
    }
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////

// find patients by patientid and telephone number
app.post("/api/findpatients", (req, res) => {
  const searchtext = req.body.searchText;

  const sql = `SELECT * FROM patients WHERE patientid LIKE ? OR telephone LIKE ? OR name LIKE ? OR engname LIKE ? `;
  const values = [`%${searchtext}%`, `%${searchtext}%`, `%${searchtext}%`, `%${searchtext}%`];

  // Execute the query
  db.query(sql, values, (err, rows) => {
    if (err) {
      res
        .status(500)
        .json({ message: "Error finding patients by ID : " + err });
    } else {
      res.status(200).json({ data: rows });
    }
  });
});

// add new appointment
app.post("/api/addnewappointment", (req, res) => {
  const { doctorName, doctorID, patientID, dateTime } = req.body;

  const sql = `INSERT INTO pt_cards (doctorid, patientid, doctor, date) VALUES (?, ?, ?, ?)`;
  const values = [doctorID, patientID, doctorName, dateTime];

  // Execute the query
  db.query(sql, values, (err, rows) => {
    if (err) {
      res
        .status(500)
        .json({ message: "Error adding new appointment : " + err });
    } else {
      res.status(200).json({ message: "Adding new appointment succeed!" });
    }
  });
});

// update appointment
app.post("/api/updateappointment", (req, res) => {
  const { cardID, dateTime } = req.body;

  const sql = `UPDATE pt_cards SET date = ? WHERE cardid = ?`;

  // Execute the query
  db.query(sql, [dateTime, cardID], (err, rows) => {
    if (err) {
      res
        .status(500)
        .json({ message: "Error updating appointment : " + err });
    } else {
      res.status(200).json({ message: "Updating appointment succeed!" });
    }
  });
});

// delete patient card
app.post("/api/deleteptcard", (req, res) => {
  const context = req.body.context;

  const sql = `DELETE FROM pt_cards WHERE cardid = ?`;
  const values = [context.cardid];

  // Execute the query
  db.query(sql, values, (err, rows) => {
    if (err) {
      res.status(500).json({ message: "Error deleting patient card : " + err });
    } else {
      res.status(200).json({ message: "Deleteing patient card succeed!" });
    }
  });
});

// --------------------------------- Check Patient -------------------------------------------

// upload files
app.post("/api/upload", upload.single("file"), (req, res) => {
  const cardid = req.body.cardid;
  const filename = req.file.filename;

  // save in sql database
  const sql = `UPDATE pt_cards SET album = CONCAT(COALESCE(album, ''), ?) WHERE cardid = ?`;
  const values = [", " + filename, cardid];

  db.query(sql, values, (err, rows) => {
    if (err) {
      res
        .status(500)
        .json({ message: "Uploading Album Image failed : " + err });
    } else {
      res.status(200).json({ message: "Uploading Album Image succeed!" });
    }
  });
});

// update check patient detail
app.post("/api/updatecheckpatient", (req, res) => {
  const {context, presentillness, presentillnessdate} = req.body;

  if (!context || !context.cardid) return;

  // update card information
  // let sql = `UPDATE pt_cards SET albumtext = ?, disease = ?, diagnosis = ?, syndromes = ?, medicines = ?, remark = ?, pasthistory = ?, pasthistorydate = ?, checked = 1 WHERE cardid = ?`;

  let sql = `UPDATE pt_cards JOIN patients ON pt_cards.patientid = patients.patientid
      SET pt_cards.albumtext = ?,    pt_cards.disease = ?,    pt_cards.diagnosis = ?,    pt_cards.syndromes = ?,    pt_cards.medicines = ?,    pt_cards.remark = ?,
        patients.pasthistory = ?,    patients.pasthistorydate = ?,    pt_cards.checked = 1 WHERE pt_cards.cardid = ?`;

  const values = [
    context.albumtext,
    context.disease,
    context.diagnosis,
    context.syndromes,
    context.medicines,
    context.remark,
    context.pasthistory,
    context.pasthistorydate,
    context.cardid,
  ];

  db.query(sql, values, (err, rows) => {
    if (err) {
      return res.status(500).json({
        message: "Updating Check Patient Card Detail failed : " + err,
      });
    }

    if (presentillness != "") {
      const sql = `INSERT INTO pt_history (id, detail, date, doctorid) VALUES (?,?,?,?)`;
      db.query(sql, [context.patientid, presentillness, presentillnessdate, context.doctorid], (err, rows) => {
        if (err) {
          return res.status(500).json({message: "Adding present illness error : " + err});
        } 
        res.status(200).json({message: "Adding present illness succeed!"});
      });
    } else  {
      res.status(200).json({message: "Updating Check Patient Card Detail succeed!"});
    }

    // update present illness history
    // sql = `SELECT * from pt_history WHERE date = ?`;
    // db.query(sql, [presentillnessdate], (err, rows) => {
    //   if (err) {
    //     return res.status(500).json({
    //       message: "Found present illness error : " + err,
    //     });
    //   } 

    //   if (rows.length == 0) {
    //     const tsql = `INSERT INTO pt_history (id, detail, date, doctorid) VALUES (?,?,?,?)`;
    //     db.query(tsql, [context.patientid, presentillness, presentillnessdate, context.doctorid], (err, rows) => {
    //       if (err) {
    //         return res.status(500).json({message: "Updating present illness error : " + err});
    //       } 
    //       res.status(200).json({message: "Updating present illness succeed!"});
    //     });
    //   } else {
    //     const tsql = `UPDATE pt_history SET detail = ? WHERE date = ?`;
    //     db.query(tsql, [presentillness, presentillnessdate], (err, rows) => {
    //       if (err) {
    //         res.status(500).json({message: "Updating present illness error : " + err});
    //       } else {
    //         res.status(200).json({message: "Updating present illness succeed!"});
    //       }
    //     });
    //   }
    // });
  });
});

// check patient status
app.post("/api/checknewpatient", (req, res) => {
  const patientid = req.body.patientid;

  // save in sql database
  const sql = `SELECT * from pt_cards WHERE patientid = ?`;
  const values = [patientid];

  db.query(sql, values, (err, rows) => {
    if (err) {
      res
        .status(500)
        .json({ message: "Uploading Album Image failed : " + err });
    } else {
      res.status(200).json({ message: "Uploading Album Image succeed!", data: rows });
    }
  });
});

// upload Avatar
app.post("/api/uploadavatar", upload.single("file"), (req, res) => {
  const filename = req.file.filename;
  res.status(200).json({ filename: filename });
});

// ------------------------------ Search Patient Card for Payment ---------------------------------
app.post("/api/getptcardpayment", (req, res) => {
  const { searchText, curDate, paidMode } = req.body;
  if (searchText) {
    db.query(
      `SELECT C.*, D.* FROM (SELECT A.*, B.patientid AS PID, B.cardid, B.doctorid, B.doctor, B.date, B.albumtext, B.disease, B.diagnosis, B.syndromes, B.toll, B.medicines, B.receipt, B.prescription FROM patients AS A LEFT JOIN pt_cards AS B ON A.patientid = B.patientid) AS C LEFT JOIN pt_history AS D ON C.patientid=D.id
        WHERE (COALESCE(C.name, '') LIKE ? OR COALESCE(C.engname, '') LIKE ? OR COALESCE(C.birthday, '') LIKE ? 
          OR COALESCE(C.patientid, '') LIKE ? OR COALESCE(C.telephone, '') LIKE ? OR COALESCE(C.address, '') LIKE ? 
          OR COALESCE(C.emergency, '') LIKE ? OR COALESCE(C.emergencynumber, '') LIKE ? OR COALESCE(C.doctorid, '') LIKE ?
          OR COALESCE(C.patientid, '') LIKE ? OR COALESCE(C.doctor, '') LIKE ? OR COALESCE(C.date, '') LIKE ?
          OR COALESCE(C.albumtext, '') LIKE ? OR COALESCE(C.disease, '') LIKE ? OR COALESCE(C.diagnosis, '') LIKE ?
          OR COALESCE(C.syndromes, '') LIKE ? OR COALESCE(C.medicines, '') LIKE ?
          OR COALESCE(C.toll, '') LIKE ? OR COALESCE(C.receipt, '') LIKE ? OR COALESCE(C.prescription, '') LIKE ?
          OR COALESCE(D.detail, '') LIKE ?)`,
      [
        `%${searchText}%`,`%${searchText}%`,`%${searchText}%`,`%${searchText}%`,`%${searchText}%`,`%${searchText}%`,
        `%${searchText}%`,`%${searchText}%`,`%${searchText}%`,`%${searchText}%`,`%${searchText}%`,`%${searchText}%`,
        `%${searchText}%`,`%${searchText}%`,`%${searchText}%`,`%${searchText}%`,`%${searchText}%`,`%${searchText}%`,
        `%${searchText}%`,`%${searchText}%`,`%${searchText}%`
      ],
      (err, rows) => {
        if (err) {
          console.log(err);
          res.status(500).send(err.message);
        } else {
          const data = JSON.parse(JSON.stringify(rows));
          res.status(200).json({ data });
        }
      }
    );
  } else {
    db.query(
      `SELECT pt_cards.*, patients.* FROM pt_cards JOIN patients ON pt_cards.patientid = patients.patientid 
        WHERE pt_cards.checked = 1 
        ${paidMode == 1 ? "AND pt_cards.paid = 0 " : ""}`,
      (err, rows) => {
        if (err) {
          res.status(500).send(err.message);
        } else {
          res.status(200).json({ data: rows });
        }
      }
    );
  }
});

app.post("/api/checkptcardpaymentstate", (req, res) => {
  const cardid = req.body.cardid;
  db.query(
    "SELECT * FROM pt_cards WHERE cardid = ? AND paid = 0",
    [cardid],
    (err, rows) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        if (rows.length > 0) res.status(200).json({ status: "true" });
        else res.status(200).json({ status: "false" });
      }
    }
  );
});

app.post("/api/updatecardpaid", (req, res) => {
  const cardid = req.body.cardid;
  db.query(
    "UPDATE pt_cards SET paid = 1 WHERE cardid = ?",
    [cardid],
    (err, rows) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.status(200).json({ data: rows });
      }
    }
  );
});

// get patient cards
app.post("/api/getptcardsbyid", (req, res) => {
  const { cardid } = req.body;
  db.query(
    "SELECT pt_cards.*, patients.* FROM pt_cards JOIN patients ON pt_cards.patientid = patients.patientid WHERE pt_cards.cardid = ?",
    [cardid],
    (err, rows) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.status(200).json({ data: rows });
      }
    }
  );
});

// get patient cards by patientid
app.post("/api/getptcardsbypatientid", (req, res) => {
  const { patientid } = req.body;
  db.query(
    "SELECT pt_cards.*, patients.* FROM pt_cards JOIN patients ON pt_cards.patientid = patients.patientid WHERE pt_cards.patientid = ?",
    [patientid],
    (err, rows) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.status(200).json({ data: rows });
      }
    }
  );
});

// --------------------------------- Receipt, Recipe, Prescription -------------------------------
app.post("/api/updateptcardreceipt", (req, res) => {
  const { cardid, curReceipt, curToll } = req.body;
  db.query(
    `UPDATE pt_cards SET receipt = ?, toll = ? WHERE cardid = ?`,
    [curReceipt, curToll, cardid],
    (err, rows) => {
      if (err) res.status(500).send(err.message);
      else res.status(200).send({ data: rows });
    }
  );
});

app.post("/api/updateptcardprescription", (req, res) => {
  const { cardid, curPrescription } = req.body;
  db.query(
    `UPDATE pt_cards SET prescription = ? WHERE cardid = ?`,
    [curPrescription, cardid],
    (err, rows) => {
      if (err) res.status(500).send(err.message);
      else res.status(200).send({ data: rows });
    }
  );
});


// --------------------------------- Social Share Function -------------------------------
async function sendPasswordResetEmail(email, token) {
  try {
    const transporter = nodemailer.createTransport({
      // Configure the email transporter (e.g., Gmail, SMTP server)
      // ...
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "ngyentuandev@gmail.com",
        pass: "flztqkcsxpgxgdtc",
      },
    });
  
    const mailOptions = {
      from: "info@doctor.com",
      to: email,
      subject: "Password Reset",
      text: `Click the following link to reset your password: http://95.216.251.189:3000/resetpassword/${token}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.messageId);
  } catch (error) {
    console.error("Error sending password reset email : ", error);
  }
}

// Server running
app.listen(8000, () => {
  console.log("Server started on port 8000!");
});
