var schools = require('./school');
var students = require('./student');
var teachers = require('./teacher');
var books = require('./book');
var sections = require('./section');
var questions = require('./question');

module.exports = [].concat(schools, students, teachers, books, sections, questions);
