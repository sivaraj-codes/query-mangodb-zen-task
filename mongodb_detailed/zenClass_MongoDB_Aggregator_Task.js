//Q1. Find all the topics and tasks which are thought in the month of October

db.topics.aggregate([
  {
    $match: {
      taughtDate: { $gte: new Date("2020-10-01"), $lt: new Date("2020-11-01") },
    },
  },
  {
    $lookup: {
      from: "tasks",
      localField: "_id",
      foreignField: "topicId",
      as: "tasks",
    },
  },
]);

db.topics.aggregate([
  {
    $match: {
      taughtDate: { $gte: new Date("2020-10-01"), $lt: new Date("2020-11-01") },
    },
  },
  {
    $lookup: {
      from: "tasks",
      localField: "_id",
      foreignField: "topicId",
      as: "tasks",
    },
  },
  { $project: { "tasks.topicId": 0 } },
]);

db.topics.aggregate([
  {
    $match: {
      taughtDate: { $gte: new Date("2020-10-01"), $lt: new Date("2020-11-01") },
    },
  },
  {
    $lookup: {
      from: "tasks",
      as: "tasks",
      let: { topicID: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$topicId", "$$topicID"] } } },
        { $project: { topicId: 0 } },
      ],
    },
  },
]);

db.topics.aggregate([
  {
    $match: {
      taughtDate: { $gte: new Date("2020-10-01"), $lt: new Date("2020-11-01") },
    },
  },
  {
    $lookup: {
      from: "tasks",
      localField: "_id",
      foreignField: "topicId",
      as: "tasks",
    },
  },
  {
    $lookup: {
      from: "courses",
      localField: "courseId",
      foreignField: "_id",
      as: "course",
    },
  },
  { $unwind: "$course" },
]);

db.topics.aggregate([
  {
    $lookup: {
      from: "tasks",
      localField: "_id",
      foreignField: "topicId",
      as: "tasks",
    },
  },
  {
    $lookup: {
      from: "courses",
      localField: "courseId",
      foreignField: "_id",
      as: "course",
    },
  },
  {
    $unwind: "$course",
  },
  {
    $project: {
      taughtDate: 1,
      topic: 1,
      courseTitle: "$course.title",
      courseId: 1,
      subCourse: 1,
      tasks: 1,
    },
  },
]);

//Q2. Find all the company drives which appeared between 15 oct-2020 and 31-oct-2020

db.company_drives.find({
  driveDate: { $gte: new Date("2020-10-15"), $lte: new Date("2020-10-31") },
});

//Q3. Find all the company drives and students who are appeared for the placement.

db.drive_apperances.aggregate([
  {
    $lookup: {
      from: "company_drives",
      localField: "driveId",
      foreignField: "_id",
      as: "drive",
    },
  },
  { $unwind: "$drive" },
  {
    $lookup: {
      from: "students",
      localField: "studentId",
      foreignField: "_id",
      as: "student",
    },
  },
  { $unwind: "$student" },
  {
    $project: {
      _id: 0,
      driveId: 1,
      studentId: 1,
      companyName: "$drive.companyName",
      driveDate: "$drive.driveDate",
      studentName: "$student.name",
    },
  },
]);

//Q4.Find the number of problems solved by the user in codekata
db.codekata_answers.aggregate([
  { $match: { isValid: true, answer: { $ne: "" } } },
  { $group: { _id: "$userId", problemSolved: { $sum: 1 } } },
  {
    $lookup: {
      from: "students",
      localField: "_id",
      foreignField: "_id",
      as: "student",
    },
  },
  { $unwind: "$student" },
  {
    $project: {
      studentName: "$student.name",
      studentId: "$student._id",
      problemSolved: 1,
    },
  },
]);

//Q5:Find all the mentors with who has the mentee's count more than 20

db.batches.aggregate([
  { $project: { mentorId: 1, studentCount: { $size: "$studentIds" } } },
  { $group: { _id: "$mentorId", totalStudents: { $sum: "$studentCount" } } },
  { $match: { totalStudents: { $gt: 20 } } },
  {
    $lookup: {
      from: "mentors",
      localField: "_id",
      foreignField: "_id",
      as: "mentor",
    },
  },
  { $unwind: "$mentor" },
  {
    $project: {
      mentorName: "$mentor.name",
      mentorId: "$mentor._id",
      totalStudents: 1,
      _id: 0,
    },
  },
]);

//Q6:Find the number of students who are absent and task is not submitted between 15 oct-2020 and 31-oct-2020

db.attendance.aggregate([
  {
    $match: {
      status: { $ne: "present" },
      date: { $gte: new Date("2020-10-15"), $lte: new Date("2020-10-31") },
    },
  },
  {
    $lookup: {
      from: "task_submitted",
      localField: "userId",
      foreignField: "userId",
      as: "submissions",
    },
  },
  { $match: { submissions: { $size: 0 } } },
  { $group: { _id: "$userId" } },
  { $count: "absentNotSubmittedStudents" },
]);
