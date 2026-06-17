// src/data/employeeData.js

// Google Drive folder IDs for different document types
const DRIVE_FOLDERS = {
  profilePhotos: 'https://drive.google.com/drive/folders/your-profile-photos-folder-id',
  aadhaar: 'https://drive.google.com/drive/folders/your-aadhaar-folder-id',
  pan: 'https://drive.google.com/drive/folders/your-pan-folder-id',
  resumes: 'https://drive.google.com/drive/folders/your-resumes-folder-id',
  education: 'https://drive.google.com/drive/folders/your-education-docs-folder-id',
  legal: 'https://drive.google.com/drive/folders/your-legal-docs-folder-id',
  onboarding: 'https://drive.google.com/drive/folders/your-onboarding-docs-folder-id'
};

// Helper function to generate Google Drive file URL
const getDriveFileUrl = (fileId) => {
  if (!fileId) return null;
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

// Helper function to get Google Drive view URL
const getDriveViewUrl = (fileId) => {
  if (!fileId) return null;
  return `https://drive.google.com/file/d/${fileId}/view`;
};

export const employeeMasterData = {
  'EMP001': {
    // Basic Information
    id: 'EMP001',
    name: 'Ravi Das',
    email: 'ravi.das@spaceborn.com',
    phone: '+91 98765 43210',
    profilePhoto: {
      fileId: '1ABC123xyz',
      url: 'https://drive.google.com/uc?export=download&id=1ABC123xyz',
      viewUrl: 'https://drive.google.com/file/d/1ABC123xyz/view',
      fileName: 'ravi_das_photo.jpg',
      uploaded: '2024-01-15'
    },
    dateOfBirth: '1995-03-15',
    gender: 'Male',
    bloodGroup: 'O+',
    
    // Login Credentials (assigned by manager)
    credentials: {
      employeeId: 'EMP001',
      password: 'Ravi@123',
      tempPassword: false,
      lastLogin: '2024-06-07 09:15:00',
      loginCount: 156,
      forceReset: false
    },
    
    // Government IDs
    aadhaar: {
      number: 'XXXX-XXXX-XXXX',
      verified: true,
      uploaded: '2024-01-15',
      fileId: '1AADHAAR001',
      fileUrl: 'https://drive.google.com/uc?export=download&id=1AADHAAR001',
      viewUrl: 'https://drive.google.com/file/d/1AADHAAR001/view',
      fileName: 'aadhaar_EMP001.pdf'
    },
    pan: {
      number: 'ABCDE1234F',
      verified: true,
      uploaded: '2024-01-15',
      fileId: '1PAN001',
      fileUrl: 'https://drive.google.com/uc?export=download&id=1PAN001',
      viewUrl: 'https://drive.google.com/file/d/1PAN001/view',
      fileName: 'pan_EMP001.pdf'
    },
    
    // Personal Details
    nationality: 'Indian',
    address: {
      street: '123 Tech Park',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    },
    emergencyContact: {
      name: 'Sita Das',
      relation: 'Spouse',
      phone: '+91 98765 43211'
    },
    
    // Education Details
    education: {
      college: 'IIT Bombay',
      degree: 'B.Tech Computer Science',
      specialization: 'Software Engineering',
      graduationYear: 2018,
      cgpa: 8.5,
      documents: [
        { 
          name: 'Degree Certificate', 
          fileId: '1DEGREE001', 
          fileUrl: 'https://drive.google.com/uc?export=download&id=1DEGREE001',
          viewUrl: 'https://drive.google.com/file/d/1DEGREE001/view',
          uploaded: '2024-01-15'
        },
        { 
          name: 'Marksheets', 
          fileId: '1MARKS001', 
          fileUrl: 'https://drive.google.com/uc?export=download&id=1MARKS001',
          viewUrl: 'https://drive.google.com/file/d/1MARKS001/view',
          uploaded: '2024-01-15'
        },
        { 
          name: 'Provisional Certificate', 
          fileId: '1PROV001', 
          fileUrl: 'https://drive.google.com/uc?export=download&id=1PROV001',
          viewUrl: 'https://drive.google.com/file/d/1PROV001/view',
          uploaded: '2024-01-15'
        }
      ]
    },
    
    // Professional Details
    designation: 'Frontend Developer',
    department: 'Engineering',
    role: 'Member',
    joinDate: '2024-01-15',
    experience: '2 years',
    skills: ['React', 'JavaScript', 'Tailwind CSS', 'Git', 'HTML/CSS'],
    
    // Documents
    resume: {
      fileName: 'ravi_das_resume.pdf',
      uploaded: '2024-01-15',
      version: 2,
      fileId: '1RESUME001',
      fileUrl: 'https://drive.google.com/uc?export=download&id=1RESUME001',
      viewUrl: 'https://drive.google.com/file/d/1RESUME001/view'
    },
    
    // Legal Agreements
    nda: {
      signed: true,
      signedDate: '2024-01-15',
      fileId: '1NDA001',
      fileUrl: 'https://drive.google.com/uc?export=download&id=1NDA001',
      viewUrl: 'https://drive.google.com/file/d/1NDA001/view',
      version: 'v2.0',
      ipAddress: '192.168.1.1'
    },
    codeOfConduct: {
      signed: true,
      signedDate: '2024-01-15',
      fileId: '1COC001',
      fileUrl: 'https://drive.google.com/uc?export=download&id=1COC001',
      viewUrl: 'https://drive.google.com/file/d/1COC001/view',
      accepted: true,
      ipAddress: '192.168.1.1'
    },
    ipAgreement: {
      signed: true,
      signedDate: '2024-01-15',
      fileId: '1IP001',
      fileUrl: 'https://drive.google.com/uc?export=download&id=1IP001',
      viewUrl: 'https://drive.google.com/file/d/1IP001/view',
      accepted: true,
      ipAddress: '192.168.1.1'
    },
    
    // Onboarding Documents
    onboardingDocs: [
      { 
        name: 'Offer Letter', 
        fileName: 'offer_letter_EMP001.pdf', 
        uploaded: '2024-01-10', 
        status: 'completed',
        fileId: '1OFFER001',
        fileUrl: 'https://drive.google.com/uc?export=download&id=1OFFER001',
        viewUrl: 'https://drive.google.com/file/d/1OFFER001/view'
      },
      { 
        name: 'Joining Form', 
        fileName: 'joining_form_EMP001.pdf', 
        uploaded: '2024-01-12', 
        status: 'completed',
        fileId: '1JOIN001',
        fileUrl: 'https://drive.google.com/uc?export=download&id=1JOIN001',
        viewUrl: 'https://drive.google.com/file/d/1JOIN001/view'
      },
      { 
        name: 'Bank Details', 
        fileName: 'bank_details_EMP001.pdf', 
        uploaded: '2024-01-13', 
        status: 'completed',
        fileId: '1BANK001',
        fileUrl: 'https://drive.google.com/uc?export=download&id=1BANK001',
        viewUrl: 'https://drive.google.com/file/d/1BANK001/view'
      },
      { 
        name: 'Tax Declaration', 
        fileName: 'tax_declaration_EMP001.pdf', 
        uploaded: '2024-01-14', 
        status: 'completed',
        fileId: '1TAX001',
        fileUrl: 'https://drive.google.com/uc?export=download&id=1TAX001',
        viewUrl: 'https://drive.google.com/file/d/1TAX001/view'
      }
    ],
    
    // Employment Status
    employmentStatus: 'active',
    workLocation: 'Remote',
    reportingManager: 'MGR001',
    
    // Performance
    performance: {
      rating: 4.2,
      lastReview: '2024-05-01',
      nextReview: '2024-08-01',
      comments: 'Great performer, meets deadlines consistently',
      achievements: ['Completed login module ahead of schedule', 'Mentored junior developers']
    },
    
    // Banking Details
    bankDetails: {
      accountNumber: 'XXXX1234',
      ifscCode: 'SBIN0012345',
      bankName: 'State Bank of India',
      accountHolderName: 'Ravi Das'
    },
    
    createdAt: '2024-01-10',
    updatedAt: '2024-06-07',
    createdBy: 'MGR001',
    updatedBy: 'MGR001'
  },
  
  'EMP002': {
    id: 'EMP002',
    name: 'Nisha Kumar',
    email: 'nisha.kumar@spaceborn.com',
    phone: '+91 87654 32109',
    profilePhoto: {
      fileId: '2PHOTO002',
      url: 'https://drive.google.com/uc?export=download&id=2PHOTO002',
      viewUrl: 'https://drive.google.com/file/d/2PHOTO002/view',
      fileName: 'nisha_kumar_photo.jpg',
      uploaded: '2024-02-10'
    },
    dateOfBirth: '1996-07-22',
    gender: 'Female',
    bloodGroup: 'B+',
    
    credentials: {
      employeeId: 'EMP002',
      password: 'Nisha@123',
      tempPassword: false,
      lastLogin: '2024-06-07 09:30:00',
      loginCount: 142,
      forceReset: false
    },
    
    aadhaar: { 
      number: 'XXXX-XXXX-XXXX', 
      verified: true, 
      uploaded: '2024-02-10', 
      fileId: '2AADHAAR002',
      fileUrl: 'https://drive.google.com/uc?export=download&id=2AADHAAR002',
      viewUrl: 'https://drive.google.com/file/d/2AADHAAR002/view',
      fileName: 'aadhaar_EMP002.pdf'
    },
    pan: { 
      number: 'FGHIJ5678K', 
      verified: true, 
      uploaded: '2024-02-10', 
      fileId: '2PAN002',
      fileUrl: 'https://drive.google.com/uc?export=download&id=2PAN002',
      viewUrl: 'https://drive.google.com/file/d/2PAN002/view',
      fileName: 'pan_EMP002.pdf'
    },
    
    nationality: 'Indian',
    address: {
      street: '456 Tech Hub',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560002',
      country: 'India'
    },
    emergencyContact: {
      name: 'Raj Kumar',
      relation: 'Brother',
      phone: '+91 87654 32108'
    },
    
    education: {
      college: 'IIT Delhi',
      degree: 'B.Tech Information Technology',
      specialization: 'Software Development',
      graduationYear: 2019,
      cgpa: 8.2,
      documents: [
        { 
          name: 'Degree Certificate', 
          fileId: '2DEGREE002', 
          fileUrl: 'https://drive.google.com/uc?export=download&id=2DEGREE002',
          viewUrl: 'https://drive.google.com/file/d/2DEGREE002/view',
          uploaded: '2024-02-10'
        },
        { 
          name: 'Marksheets', 
          fileId: '2MARKS002', 
          fileUrl: 'https://drive.google.com/uc?export=download&id=2MARKS002',
          viewUrl: 'https://drive.google.com/file/d/2MARKS002/view',
          uploaded: '2024-02-10'
        }
      ]
    },
    
    designation: 'Backend Developer',
    department: 'Engineering',
    role: 'Member',
    joinDate: '2024-02-10',
    experience: '1.5 years',
    skills: ['Node.js', 'Python', 'MongoDB', 'Express', 'PostgreSQL'],
    
    resume: { 
      fileName: 'nisha_kumar_resume.pdf', 
      uploaded: '2024-02-10', 
      version: 1,
      fileId: '2RESUME002',
      fileUrl: 'https://drive.google.com/uc?export=download&id=2RESUME002',
      viewUrl: 'https://drive.google.com/file/d/2RESUME002/view'
    },
    
    nda: { 
      signed: true, 
      signedDate: '2024-02-10', 
      fileId: '2NDA002',
      fileUrl: 'https://drive.google.com/uc?export=download&id=2NDA002',
      viewUrl: 'https://drive.google.com/file/d/2NDA002/view',
      version: 'v2.0', 
      ipAddress: '192.168.1.2' 
    },
    codeOfConduct: { 
      signed: true, 
      signedDate: '2024-02-10',
      fileId: '2COC002',
      fileUrl: 'https://drive.google.com/uc?export=download&id=2COC002',
      viewUrl: 'https://drive.google.com/file/d/2COC002/view',
      accepted: true, 
      ipAddress: '192.168.1.2' 
    },
    ipAgreement: { 
      signed: true, 
      signedDate: '2024-02-10',
      fileId: '2IP002',
      fileUrl: 'https://drive.google.com/uc?export=download&id=2IP002',
      viewUrl: 'https://drive.google.com/file/d/2IP002/view',
      accepted: true, 
      ipAddress: '192.168.1.2' 
    },
    
    onboardingDocs: [
      { 
        name: 'Offer Letter', 
        fileName: 'offer_letter_EMP002.pdf', 
        uploaded: '2024-02-05', 
        status: 'completed',
        fileId: '2OFFER002',
        fileUrl: 'https://drive.google.com/uc?export=download&id=2OFFER002',
        viewUrl: 'https://drive.google.com/file/d/2OFFER002/view'
      },
      { 
        name: 'Joining Form', 
        fileName: 'joining_form_EMP002.pdf', 
        uploaded: '2024-02-07', 
        status: 'completed',
        fileId: '2JOIN002',
        fileUrl: 'https://drive.google.com/uc?export=download&id=2JOIN002',
        viewUrl: 'https://drive.google.com/file/d/2JOIN002/view'
      }
    ],
    
    employmentStatus: 'active',
    workLocation: 'Hybrid',
    reportingManager: 'MGR001',
    
    performance: { 
      rating: 4.0, 
      lastReview: '2024-05-01', 
      nextReview: '2024-08-01', 
      comments: 'Good technical skills', 
      achievements: ['Fixed critical bugs'] 
    },
    bankDetails: { 
      accountNumber: 'XXXX5678', 
      ifscCode: 'HDFC0012345', 
      bankName: 'HDFC Bank', 
      accountHolderName: 'Nisha Kumar' 
    },
    
    createdAt: '2024-02-05',
    updatedAt: '2024-06-07',
    createdBy: 'MGR001',
    updatedBy: 'MGR001'
  }
};

// Helper function to update employee document with Google Drive file ID
export const updateEmployeeDocument = (employeeId, documentType, fileId, fileName) => {
  const employee = employeeMasterData[employeeId];
  if (!employee) return null;

  const driveFileUrl = getDriveFileUrl(fileId);
  const driveViewUrl = getDriveViewUrl(fileId);

  switch(documentType) {
    case 'profilePhoto':
      employee.profilePhoto = {
        fileId, fileName, fileUrl: driveFileUrl, viewUrl: driveViewUrl,
        uploaded: new Date().toISOString().split('T')[0]
      };
      break;
    case 'aadhaar':
      employee.aadhaar = {
        ...employee.aadhaar,
        fileId, fileName, fileUrl: driveFileUrl, viewUrl: driveViewUrl,
        uploaded: new Date().toISOString().split('T')[0]
      };
      break;
    case 'pan':
      employee.pan = {
        ...employee.pan,
        fileId, fileName, fileUrl: driveFileUrl, viewUrl: driveViewUrl,
        uploaded: new Date().toISOString().split('T')[0]
      };
      break;
    case 'resume':
      employee.resume = {
        ...employee.resume,
        fileId, fileName, fileUrl: driveFileUrl, viewUrl: driveViewUrl,
        uploaded: new Date().toISOString().split('T')[0],
        version: (employee.resume?.version || 0) + 1
      };
      break;
    case 'nda':
      employee.nda = {
        ...employee.nda,
        fileId, fileName, fileUrl: driveFileUrl, viewUrl: driveViewUrl
      };
      break;
    case 'codeOfConduct':
      employee.codeOfConduct = {
        ...employee.codeOfConduct,
        fileId, fileName, fileUrl: driveFileUrl, viewUrl: driveViewUrl
      };
      break;
    case 'ipAgreement':
      employee.ipAgreement = {
        ...employee.ipAgreement,
        fileId, fileName, fileUrl: driveFileUrl, viewUrl: driveViewUrl
      };
      break;
    case 'onboarding':
      employee.onboardingDocs.push({
        name: fileName,
        fileName: fileName,
        fileId, fileUrl: driveFileUrl, viewUrl: driveViewUrl,
        uploaded: new Date().toISOString().split('T')[0],
        status: 'completed'
      });
      break;
    case 'education':
      employee.education.documents.push({
        name: fileName,
        fileId, fileUrl: driveFileUrl, viewUrl: driveViewUrl,
        uploaded: new Date().toISOString().split('T')[0]
      });
      break;
    default:
      return null;
  }

  employee.updatedAt = new Date().toISOString().split('T')[0];
  return employee;
};

// Generate new employee ID
export const generateEmployeeId = () => {
  const count = Object.keys(employeeMasterData).length;
  const nextNumber = count + 1;
  const newId = `EMP${String(nextNumber).padStart(3, '0')}`;
  return newId;
};

// Generate random password
const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password + '@123';
};

// Add new employee
export const addEmployee = (employeeData) => {
  const newId = generateEmployeeId();
  const now = new Date().toISOString().split('T')[0];
  
  const newEmployee = {
    id: newId,
    ...employeeData,
    credentials: {
      employeeId: newId,
      password: generateRandomPassword(),
      tempPassword: true,
      lastLogin: null,
      loginCount: 0,
      forceReset: true
    },
    profilePhoto: null,
    aadhaar: { verified: false },
    pan: { verified: false },
    education: { documents: [] },
    resume: null,
    nda: { signed: false, signedDate: null },
    codeOfConduct: { signed: false, accepted: false },
    ipAgreement: { signed: false, accepted: false },
    onboardingDocs: [],
    employmentStatus: 'active',
    performance: { rating: 0, lastReview: null, nextReview: null, comments: '', achievements: [] },
    createdAt: now,
    updatedAt: now,
    createdBy: 'MGR001',
    updatedBy: 'MGR001'
  };
  
  employeeMasterData[newId] = newEmployee;
  return newEmployee;
};

// Update employee
export const updateEmployee = (id, updateData) => {
  if (employeeMasterData[id]) {
    employeeMasterData[id] = {
      ...employeeMasterData[id],
      ...updateData,
      updatedAt: new Date().toISOString().split('T')[0],
      updatedBy: 'MGR001'
    };
    return employeeMasterData[id];
  }
  return null;
};

// Delete employee (soft delete)
export const deleteEmployee = (id) => {
  if (employeeMasterData[id]) {
    employeeMasterData[id].employmentStatus = 'terminated';
    employeeMasterData[id].updatedAt = new Date().toISOString().split('T')[0];
    return true;
  }
  return false;
};

// Get employee by ID
export const getEmployeeById = (id) => {
  return employeeMasterData[id] || null;
};

// Get all employees
export const getAllEmployees = () => {
  return Object.values(employeeMasterData);
};

// Get employees by department
export const getEmployeesByDepartment = (department) => {
  return Object.values(employeeMasterData).filter(emp => emp.department === department);
};

// Get employees by status
export const getEmployeesByStatus = (status) => {
  return Object.values(employeeMasterData).filter(emp => emp.employmentStatus === status);
};

// Get statistics
export const getEmployeeStats = () => {
  const employees = Object.values(employeeMasterData);
  return {
    total: employees.length,
    active: employees.filter(e => e.employmentStatus === 'active').length,
    onLeave: employees.filter(e => e.employmentStatus === 'on_leave').length,
    terminated: employees.filter(e => e.employmentStatus === 'terminated').length,
    ndaSigned: employees.filter(e => e.nda?.signed).length,
    codeOfConductSigned: employees.filter(e => e.codeOfConduct?.signed).length,
    ipAgreementSigned: employees.filter(e => e.ipAgreement?.signed).length
  };
};

// Reset password
export const resetEmployeePassword = (id) => {
  if (employeeMasterData[id]) {
    const newPassword = generateRandomPassword();
    employeeMasterData[id].credentials.password = newPassword;
    employeeMasterData[id].credentials.tempPassword = true;
    employeeMasterData[id].credentials.forceReset = true;
    employeeMasterData[id].updatedAt = new Date().toISOString().split('T')[0];
    return newPassword;
  }
  return null;
};

// Get all employee documents organized by type
export const getEmployeeDocumentsByType = (employeeId) => {
  const employee = employeeMasterData[employeeId];
  if (!employee) return null;

  return {
    profilePhoto: employee.profilePhoto,
    governmentIds: {
      aadhaar: employee.aadhaar,
      pan: employee.pan
    },
    education: employee.education?.documents || [],
    resume: employee.resume,
    legalAgreements: {
      nda: employee.nda,
      codeOfConduct: employee.codeOfConduct,
      ipAgreement: employee.ipAgreement
    },
    onboardingDocs: employee.onboardingDocs || []
  };
};