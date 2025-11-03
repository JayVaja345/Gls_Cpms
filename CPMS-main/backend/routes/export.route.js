// const express = require('express');
// const router = express.Router();
// const { Parser } = require('json2csv');
// const User = require('../models/user.model');

// // Helper function to format student data for CSV
// const formatStudentData = (students) => {
//     return students.map(student => {
//         // Calculate full name
//         const fullName = [student.first_name, student.middle_name, student.last_name]
//             .filter(name => name && name.trim() !== '')
//             .join(' ');

//         // Calculate current age from dateOfBirth
//         let age = '';
//         if (student.dateOfBirth) {
//             const birthDate = new Date(student.dateOfBirth);
//             const today = new Date();
//             age = today.getFullYear() - birthDate.getFullYear();
//         }

//         // Calculate average SGPA
//         let averageSGPA = 0;
//         let sgpaCount = 0;
//         if (student.studentProfile && student.studentProfile.SGPA) {
//             const sgpa = student.studentProfile.SGPA;
//             const sgpaValues = [sgpa.sem1, sgpa.sem2, sgpa.sem3, sgpa.sem4, sgpa.sem5, sgpa.sem6, sgpa.sem7, sgpa.sem8];
//             const validSGPAs = sgpaValues.filter(val => val && val > 0);
//             if (validSGPAs.length > 0) {
//                 averageSGPA = validSGPAs.reduce((sum, val) => sum + val, 0) / validSGPAs.length;
//             }
//             sgpaCount = validSGPAs.length;
//         }

//         return {
//             rollNumber: student.studentProfile?.rollNumber || 'N/A',
//             UIN: student.studentProfile?.UIN || 'N/A',
//             fullName: fullName,
//             email: student.email,
//             phone: student.number || 'N/A',
//             gender: student.gender || 'N/A',
//             dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A',
//             age: age,
//             department: student.studentProfile?.department || 'N/A',
//             year: student.studentProfile?.year || 'N/A',
//             admissionYear: student.studentProfile?.addmissionYear || 'N/A',
//             gap: student.studentProfile?.gap ? 'Yes' : 'No',
//             liveKT: student.studentProfile?.liveKT || 0,
//             averageSGPA: averageSGPA.toFixed(2),
//             completedSemesters: sgpaCount,
//             sscPercentage: student.studentProfile?.pastQualification?.ssc?.percentage || 'N/A',
//             hscPercentage: student.studentProfile?.pastQualification?.hsc?.percentage || 'N/A',
//             diplomaPercentage: student.studentProfile?.pastQualification?.diploma?.percentage || 'N/A',
//             isApproved: student.studentProfile?.isApproved ? 'Yes' : 'No',
//             isProfileCompleted: student.isProfileCompleted ? 'Yes' : 'No',
//             appliedJobsCount: student.studentProfile?.appliedJobs?.length || 0,
//             internshipsCount: student.studentProfile?.internships?.length || 0,
//             address: student.fullAddress?.address || 'N/A',
//             pincode: student.fullAddress?.pincode || 'N/A',
//             createdAt: new Date(student.createdAt).toLocaleDateString()
//         };
//     });
// };

// // Export Students to CSV
// router.get('/students/csv', async (req, res) => {
//     try {
//         const { department, year, isApproved } = req.query;
        
//         // Build query for students only
//         let query = { role: 'student' };
        
//         // Add filters if provided
//         if (department) query['studentProfile.department'] = department;
//         if (year) query['studentProfile.year'] = parseInt(year);
//         if (isApproved !== undefined) query['studentProfile.isApproved'] = isApproved === 'true';

//         const students = await User.find(query);
//         const formattedData = formatStudentData(students);

//         const fields = [
//             { label: 'Roll Number', value: 'rollNumber' },
//             { label: 'UIN', value: 'UIN' },
//             { label: 'Full Name', value: 'fullName' },
//             { label: 'Email', value: 'email' },
//             { label: 'Phone', value: 'phone' },
//             { label: 'Gender', value: 'gender' },
//             { label: 'Date of Birth', value: 'dateOfBirth' },
//             { label: 'Age', value: 'age' },
//             { label: 'Department', value: 'department' },
//             { label: 'Year', value: 'year' },
//             { label: 'Admission Year', value: 'admissionYear' },
//             { label: 'Has Gap', value: 'gap' },
//             { label: 'Live KTs', value: 'liveKT' },
//             { label: 'Average SGPA', value: 'averageSGPA' },
//             { label: 'Completed Semesters', value: 'completedSemesters' },
//             { label: 'SSC %', value: 'sscPercentage' },
//             { label: 'HSC %', value: 'hscPercentage' },
//             { label: 'Diploma %', value: 'diplomaPercentage' },
//             { label: 'Is Approved', value: 'isApproved' },
//             { label: 'Profile Completed', value: 'isProfileCompleted' },
//             { label: 'Jobs Applied', value: 'appliedJobsCount' },
//             { label: 'Internships', value: 'internshipsCount' },
//             { label: 'Address', value: 'address' },
//             { label: 'Pincode', value: 'pincode' },
//             { label: 'Created Date', value: 'createdAt' }
//         ];

//         const parser = new Parser({ fields });
//         const csv = parser.parse(formattedData);
        
//         res.header('Content-Type', 'text/csv');
//         res.attachment('students-data.csv');
//         res.send(csv);
//     } catch (error) {
//         console.error('CSV Export Error:', error);
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;





const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const User = require('../models/user.model');

// Helper function to format student data
const formatStudentData = (students) => {
    return students.map(student => {
        // Calculate full name
        const fullName = [student.first_name, student.middle_name, student.last_name]
            .filter(name => name && name.trim() !== '')
            .join(' ');

        // Calculate current age from dateOfBirth
        let age = '';
        if (student.dateOfBirth) {
            const birthDate = new Date(student.dateOfBirth);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
        }

        // Calculate average SGPA
        let averageSGPA = 0;
        let sgpaCount = 0;
        if (student.studentProfile && student.studentProfile.SGPA) {
            const sgpa = student.studentProfile.SGPA;
            const sgpaValues = [sgpa.sem1, sgpa.sem2, sgpa.sem3, sgpa.sem4, sgpa.sem5, sgpa.sem6, sgpa.sem7, sgpa.sem8];
            const validSGPAs = sgpaValues.filter(val => val && val > 0);
            if (validSGPAs.length > 0) {
                averageSGPA = validSGPAs.reduce((sum, val) => sum + val, 0) / validSGPAs.length;
            }
            sgpaCount = validSGPAs.length;
        }

        return {
            rollNumber: student.studentProfile?.rollNumber || 'N/A',
            UIN: student.studentProfile?.UIN || 'N/A',
            fullName: fullName,
            email: student.email,
            phone: student.number || 'N/A',
            gender: student.gender || 'N/A',
            dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A',
            age: age,
            department: student.studentProfile?.department || 'N/A',
            year: student.studentProfile?.year || 'N/A',
            admissionYear: student.studentProfile?.addmissionYear || 'N/A',
            gap: student.studentProfile?.gap ? 'Yes' : 'No',
            liveKT: student.studentProfile?.liveKT || 0,
            averageSGPA: averageSGPA.toFixed(2),
            completedSemesters: sgpaCount,
            sscPercentage: student.studentProfile?.pastQualification?.ssc?.percentage || 'N/A',
            hscPercentage: student.studentProfile?.pastQualification?.hsc?.percentage || 'N/A',
            diplomaPercentage: student.studentProfile?.pastQualification?.diploma?.percentage || 'N/A',
            isApproved: student.studentProfile?.isApproved ? 'Yes' : 'No',
            isProfileCompleted: student.isProfileCompleted ? 'Yes' : 'No',
            appliedJobsCount: student.studentProfile?.appliedJobs?.length || 0,
            internshipsCount: student.studentProfile?.internships?.length || 0,
            address: student.fullAddress?.address || 'N/A',
            pincode: student.fullAddress?.pincode || 'N/A',
            createdAt: new Date(student.createdAt).toLocaleDateString()
        };
    });
};

// Export Students to CSV
router.get('/students/csv', async (req, res) => {
    try {
        const { department, year, isApproved } = req.query;
        
        let query = { role: 'student' };
        if (department) query['studentProfile.department'] = department;
        if (year) query['studentProfile.year'] = parseInt(year);
        if (isApproved !== undefined) query['studentProfile.isApproved'] = isApproved === 'true';

        const students = await User.find(query);
        const formattedData = formatStudentData(students);

        const fields = [
            { label: 'Roll Number', value: 'rollNumber' },
            { label: 'UIN', value: 'UIN' },
            { label: 'Full Name', value: 'fullName' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Gender', value: 'gender' },
            { label: 'Date of Birth', value: 'dateOfBirth' },
            { label: 'Age', value: 'age' },
            { label: 'Department', value: 'department' },
            { label: 'Year', value: 'year' },
            { label: 'Admission Year', value: 'admissionYear' },
            { label: 'Has Gap', value: 'gap' },
            { label: 'Live KTs', value: 'liveKT' },
            { label: 'Average SGPA', value: 'averageSGPA' },
            { label: 'Completed Semesters', value: 'completedSemesters' },
            { label: 'SSC %', value: 'sscPercentage' },
            { label: 'HSC %', value: 'hscPercentage' },
            { label: 'Diploma %', value: 'diplomaPercentage' },
            { label: 'Is Approved', value: 'isApproved' },
            { label: 'Profile Completed', value: 'isProfileCompleted' },
            { label: 'Jobs Applied', value: 'appliedJobsCount' },
            { label: 'Internships', value: 'internshipsCount' },
            { label: 'Address', value: 'address' },
            { label: 'Pincode', value: 'pincode' },
            { label: 'Created Date', value: 'createdAt' }
        ];

        const parser = new Parser({ fields });
        const csv = parser.parse(formattedData);
        
        res.header('Content-Type', 'text/csv');
        res.attachment('students-data.csv');
        res.send(csv);
    } catch (error) {
        console.error('CSV Export Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Export Students to PDF
// Export Students to PDF
router.get('/students/pdf', async (req, res) => {
    try {
        const { department, year, isApproved } = req.query;
        
        let query = { role: 'student' };
        if (department) query['studentProfile.department'] = department;
        if (year) query['studentProfile.year'] = parseInt(year);
        if (isApproved !== undefined) query['studentProfile.isApproved'] = isApproved === 'true';

        const students = await User.find(query);
        const formattedData = formatStudentData(students);

        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=students-data.pdf');
        
        doc.pipe(res);

        // Add title and header
        doc.fontSize(20).font('Helvetica-Bold')
           .text('STUDENTS DATA REPORT', { align: 'center' });
        doc.moveDown(0.5);

        // Add generation info
        doc.fontSize(10).font('Helvetica')
           .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        
        // Add filters info
        let filtersText = 'Filters: ';
        const filters = [];
        if (department) filters.push(`Department: ${department}`);
        if (year) filters.push(`Year: ${year}`);
        if (isApproved !== undefined) filters.push(`Status: ${isApproved === 'true' ? 'Approved' : 'Not Approved'}`);
        
        if (filters.length > 0) {
            filtersText += filters.join(', ');
        } else {
            filtersText += 'All Students';
        }
        
        doc.text(filtersText, { align: 'center' });
        doc.text(`Total Students: ${formattedData.length}`, { align: 'center' });
        doc.moveDown();

        if (formattedData.length === 0) {
            doc.fontSize(12).text('No student data found matching the criteria.', { align: 'center' });
            doc.end();
            return;
        }

        // Define table columns with proper widths
        const columns = [
            { name: 'Roll No', key: 'rollNumber', width: 60 },
            { name: 'Name', key: 'fullName', width: 100 },
            { name: 'Email', key: 'email', width: 120 },
            { name: 'Department', key: 'department', width: 80 },
            { name: 'Year', key: 'year', width: 40 },
            { name: 'Phone', key: 'phone', width: 80 },
            { name: 'Gender', key: 'gender', width: 50 },
            { name: 'Avg SGPA', key: 'averageSGPA', width: 50 },
            { name: 'Approved', key: 'isApproved', width: 50 }
        ];

        let yPosition = doc.y;
        const leftMargin = 50;

        // Function to draw table rows
        const drawTableRow = (isHeader = false, rowData = null) => {
            let xPosition = leftMargin;
            
            columns.forEach(column => {
                const value = isHeader ? column.name : (rowData[column.key] || 'N/A');
                
                if (isHeader) {
                    doc.fontSize(8).font('Helvetica-Bold');
                } else {
                    doc.fontSize(7).font('Helvetica');
                }
                
                doc.text(String(value), xPosition, yPosition, { 
                    width: column.width,
                    align: 'left'
                });
                
                xPosition += column.width;
            });
            
            yPosition += 15;
        };

        // Function to draw horizontal line
        const drawLine = () => {
            doc.moveTo(leftMargin, yPosition)
               .lineTo(doc.page.width - 50, yPosition)
               .stroke();
            yPosition += 5;
        };

        // Draw table header
        drawTableRow(true);
        drawLine();

        // Draw student data rows
        formattedData.forEach((student, index) => {
            // Check if we need a new page
            if (yPosition > doc.page.height - 50) {
                doc.addPage();
                yPosition = 50;
                
                // Draw header on new page
                drawTableRow(true);
                drawLine();
            }
            
            drawTableRow(false, student);
            
            // Add subtle separator line
            if (index < formattedData.length - 1) {
                doc.moveTo(leftMargin, yPosition - 2)
                   .lineTo(doc.page.width - 50, yPosition - 2)
                   .strokeColor('#e5e7eb')
                   .stroke();
            }
        });

        // Add detailed tables for academic information on new page
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold')
           .text('ACADEMIC DETAILS', { align: 'center' });
        doc.moveDown();

        // Academic details table
        const academicColumns = [
            { name: 'Roll No', key: 'rollNumber', width: 60 },
            { name: 'Name', key: 'fullName', width: 100 },
            { name: 'Admission Year', key: 'admissionYear', width: 70 },
            { name: 'Has Gap', key: 'gap', width: 50 },
            { name: 'Live KTs', key: 'liveKT', width: 50 },
            { name: 'Avg SGPA', key: 'averageSGPA', width: 50 },
            { name: 'Semesters', key: 'completedSemesters', width: 50 },
            { name: 'SSC %', key: 'sscPercentage', width: 40 },
            { name: 'HSC %', key: 'hscPercentage', width: 40 },
            { name: 'Diploma %', key: 'diplomaPercentage', width: 50 }
        ];

        yPosition = doc.y;

        // Draw academic table header
        const drawAcademicRow = (isHeader = false, rowData = null) => {
            let xPosition = leftMargin;
            
            academicColumns.forEach(column => {
                const value = isHeader ? column.name : (rowData[column.key] || 'N/A');
                
                if (isHeader) {
                    doc.fontSize(8).font('Helvetica-Bold');
                } else {
                    doc.fontSize(7).font('Helvetica');
                }
                
                doc.text(String(value), xPosition, yPosition, { 
                    width: column.width,
                    align: 'left'
                });
                
                xPosition += column.width;
            });
            
            yPosition += 15;
        };

        drawAcademicRow(true);
        drawLine();

        // Draw academic data rows
        formattedData.forEach((student, index) => {
            if (yPosition > doc.page.height - 50) {
                doc.addPage();
                yPosition = 50;
                drawAcademicRow(true);
                drawLine();
            }
            
            drawAcademicRow(false, student);
            
            if (index < formattedData.length - 1) {
                doc.moveTo(leftMargin, yPosition - 2)
                   .lineTo(doc.page.width - 50, yPosition - 2)
                   .strokeColor('#e5e7eb')
                   .stroke();
            }
        });

        // Add status and address information on new page
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold')
           .text('STATUS & ADDITIONAL INFORMATION', { align: 'center' });
        doc.moveDown();

        // Status table
        const statusColumns = [
            { name: 'Roll No', key: 'rollNumber', width: 60 },
            { name: 'Name', key: 'fullName', width: 100 },
            { name: 'Approved', key: 'isApproved', width: 50 },
            { name: 'Profile Done', key: 'isProfileCompleted', width: 60 },
            { name: 'Jobs Applied', key: 'appliedJobsCount', width: 50 },
            { name: 'Internships', key: 'internshipsCount', width: 50 },
            { name: 'Address', key: 'address', width: 120 },
            { name: 'Pincode', key: 'pincode', width: 50 }
        ];

        yPosition = doc.y;

        // Draw status table header
        const drawStatusRow = (isHeader = false, rowData = null) => {
            let xPosition = leftMargin;
            
            statusColumns.forEach(column => {
                const value = isHeader ? column.name : (rowData[column.key] || 'N/A');
                
                if (isHeader) {
                    doc.fontSize(8).font('Helvetica-Bold');
                } else {
                    doc.fontSize(7).font('Helvetica');
                }
                
                // Handle long address text
                if (column.key === 'address' && !isHeader && value.length > 30) {
                    doc.text(value.substring(0, 30) + '...', xPosition, yPosition, { 
                        width: column.width,
                        align: 'left'
                    });
                } else {
                    doc.text(String(value), xPosition, yPosition, { 
                        width: column.width,
                        align: 'left'
                    });
                }
                
                xPosition += column.width;
            });
            
            yPosition += 15;
        };

        drawStatusRow(true);
        drawLine();

        // Draw status data rows
        formattedData.forEach((student, index) => {
            if (yPosition > doc.page.height - 50) {
                doc.addPage();
                yPosition = 50;
                drawStatusRow(true);
                drawLine();
            }
            
            drawStatusRow(false, student);
            
            if (index < formattedData.length - 1) {
                doc.moveTo(leftMargin, yPosition - 2)
                   .lineTo(doc.page.width - 50, yPosition - 2)
                   .strokeColor('#e5e7eb')
                   .stroke();
            }
        });

        // Add summary statistics at the end
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold')
           .text('SUMMARY STATISTICS', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).font('Helvetica');
        
        // Department-wise count
        const deptCount = {};
        formattedData.forEach(student => {
            deptCount[student.department] = (deptCount[student.department] || 0) + 1;
        });
        
        doc.text('Department-wise Distribution:');
        Object.entries(deptCount).forEach(([dept, count]) => {
            doc.text(`  ${dept}: ${count} students`, { indent: 20 });
        });
        doc.moveDown(0.5);
        
        // Year-wise count
        const yearCount = {};
        formattedData.forEach(student => {
            yearCount[student.year] = (yearCount[student.year] || 0) + 1;
        });
        
        doc.text('Year-wise Distribution:');
        Object.entries(yearCount).forEach(([year, count]) => {
            doc.text(`  Year ${year}: ${count} students`, { indent: 20 });
        });
        doc.moveDown(0.5);
        
        // Approval status
        const approvedCount = formattedData.filter(s => s.isApproved === 'Yes').length;
        doc.text(`Approved Students: ${approvedCount}`);
        doc.text(`Pending Approval: ${formattedData.length - approvedCount}`);
        doc.moveDown(0.5);

        // Profile completion status
        const completedCount = formattedData.filter(s => s.isProfileCompleted === 'Yes').length;
        doc.text(`Profiles Completed: ${completedCount}`);
        doc.text(`Profiles Incomplete: ${formattedData.length - completedCount}`);

        doc.end();
    } catch (error) {
        console.error('PDF Export Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;