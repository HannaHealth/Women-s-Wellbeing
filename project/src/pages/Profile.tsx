import React, { useState, useEffect } from 'react';
import { User, Settings, Shield, Bell, Download, HelpCircle, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useHealthData } from '../contexts/HealthDataContext';

const Profile: React.FC = () => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const { healthProfile, updateHealthProfile } = useHealthData();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    dateOfBirth: '',
    country: '',
    height: '',
    medicalConditions: [] as string[],
    medications: [] as string[],
    dietType: '',
    activityLevel: '',
  });

  // Pre-fill form if health profile exists
  useEffect(() => {
    if (healthProfile) {
      setFormData({
        fullName: '',
        email: user?.email || '',
        dateOfBirth: '',
        country: '',
        height: healthProfile.height ? healthProfile.height.toString() : '',
        medicalConditions: Array.isArray(healthProfile.medical_conditions) 
          ? healthProfile.medical_conditions 
          : [],
        medications: Array.isArray(healthProfile.medications) 
          ? healthProfile.medications 
          : [],
        dietType: healthProfile.lifestyle_factors?.diet_type || '',
        activityLevel: healthProfile.lifestyle_factors?.activity_level || '',
      });
    }
  }, [healthProfile, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'medicalConditions' | 'medications') => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({ 
        ...formData, 
        [category]: [...formData[category], value] 
      });
    } else {
      setFormData({ 
        ...formData, 
        [category]: formData[category].filter(item => item !== value) 
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real app, this would save the profile data to the database
      await updateHealthProfile({
        height: formData.height ? parseFloat(formData.height) : null,
        medical_conditions: formData.medicalConditions,
        medications: formData.medications,
        lifestyle_factors: {
          diet_type: formData.dietType,
          activity_level: formData.activityLevel,
          stress_level: healthProfile?.lifestyle_factors?.stress_level || '',
          sleep_quality: healthProfile?.lifestyle_factors?.sleep_quality || '',
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const renderProfileTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-blue-600 font-medium text-sm"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a country</option>
                <option value="us">United States</option>
                <option value="ca">Canada</option>
                <option value="mx">Mexico</option>
                <option value="in">India</option>
                <option value="ng">Nigeria</option>
                <option value="ke">Kenya</option>
                <option value="za">South Africa</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Health Information</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical Conditions
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {['Type 2 Diabetes', 'Pre-diabetes', 'Hypertension', 'High Cholesterol', 'Obesity', 'Heart Disease', 'Thyroid Disorder'].map(condition => (
                  <label key={condition} className="flex items-center">
                    <input
                      type="checkbox"
                      value={condition}
                      checked={formData.medicalConditions.includes(condition)}
                      onChange={(e) => handleCheckboxChange(e, 'medicalConditions')}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{condition}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Medications
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {['Metformin', 'Insulin', 'GLP-1 agonists', 'DPP-4 inhibitors', 'SGLT2 inhibitors', 'Blood pressure medication', 'Cholesterol medication'].map(medication => (
                  <label key={medication} className="flex items-center">
                    <input
                      type="checkbox"
                      value={medication}
                      checked={formData.medications.includes(medication)}
                      onChange={(e) => handleCheckboxChange(e, 'medications')}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{medication}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="dietType" className="block text-sm font-medium text-gray-700 mb-1">
                  Dietary Preference
                </label>
                <select
                  id="dietType"
                  name="dietType"
                  value={formData.dietType}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a diet type</option>
                  <option value="omnivore">Omnivore (meat and plants)</option>
                  <option value="pescatarian">Pescatarian</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="keto">Keto</option>
                  <option value="paleo">Paleo</option>
                  <option value="mediterranean">Mediterranean</option>
                  <option value="low-carb">Low-carb</option>
                </select>
              </div>

              <div>
                <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Level
                </label>
                <select
                  id="activityLevel"
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select activity level</option>
                  <option value="sedentary">Sedentary (little to no exercise)</option>
                  <option value="lightly-active">Lightly active (1-3 days/week)</option>
                  <option value="moderately-active">Moderately active (3-5 days/week)</option>
                  <option value="very-active">Very active (6-7 days/week)</option>
                  <option value="extremely-active">Extremely active (physical job or twice daily training)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
              <p className="mt-1 text-gray-800">{user?.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
              <p className="mt-1 text-gray-800">{formData.fullName || 'Not provided'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Country</h3>
              <p className="mt-1 text-gray-800">{formData.country || 'Not provided'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Height</h3>
              <p className="mt-1 text-gray-800">{formData.height ? `${formData.height} cm` : 'Not provided'}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Health Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Medical Conditions</h4>
                {formData.medicalConditions && formData.medicalConditions.length > 0 ? (
                  <ul className="mt-1 list-disc list-inside text-gray-800">
                    {formData.medicalConditions.map((condition, index) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-gray-800">None provided</p>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Current Medications</h4>
                {formData.medications && formData.medications.length > 0 ? (
                  <ul className="mt-1 list-disc list-inside text-gray-800">
                    {formData.medications.map((medication, index) => (
                      <li key={index}>{medication}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-gray-800">None provided</p>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Dietary Preference</h4>
                <p className="mt-1 text-gray-800">{formData.dietType || 'Not provided'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Activity Level</h4>
                <p className="mt-1 text-gray-800">{formData.activityLevel || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Account Settings</h2>
      
      <div className="space-y-6">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Notification Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Daily Reminders</span>
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Weekly Progress Reports</span>
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Health Tips & Education</span>
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Appointment Reminders</span>
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
            </label>
          </div>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Units & Measurements</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Glucose Units
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="mg/dL">mg/dL</option>
                <option value="mmol/L">mmol/L</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight Units
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height Units
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="cm">Centimeters (cm)</option>
                <option value="ft">Feet/Inches (ft, in)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Data Management</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-700 font-medium">Export Health Data</p>
                <p className="text-gray-500 text-sm">Download all your health data in CSV format</p>
              </div>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
            <div>
              <button className="text-red-600 text-sm font-medium">Delete Account</button>
              <p className="text-gray-500 text-xs mt-1">
                This will permanently delete all your data from our system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Privacy & Security</h2>
      
      <div className="space-y-6">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Password Management</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input 
                type="password" 
                className="w-full p-2 border border-gray-300 rounded-md" 
                placeholder="Enter your current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input 
                type="password" 
                className="w-full p-2 border border-gray-300 rounded-md" 
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input 
                type="password" 
                className="w-full p-2 border border-gray-300 rounded-md" 
                placeholder="Confirm new password"
              />
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Update Password
            </button>
          </div>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Data Sharing</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-gray-700 font-medium">Anonymous Research Data</span>
                <p className="text-gray-500 text-xs">
                  Allow your anonymized data to be used for research to improve diabetes care
                </p>
              </div>
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <span className="text-gray-700 font-medium">Third-party Applications</span>
                <p className="text-gray-500 text-xs">
                  Allow integration with other health apps and services
                </p>
              </div>
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
            </label>
          </div>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Privacy Information</h3>
          <p className="text-gray-600 mb-4">
            OpenHanna AI is committed to protecting your privacy and complies with GDPR and HIPAA regulations. Your health data is encrypted and securely stored.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-blue-600 text-sm font-medium">Privacy Policy</a>
            <a href="#" className="text-blue-600 text-sm font-medium">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSupportTab = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Help & Support</h2>
      
      <div className="space-y-6">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800">How is my data secured?</h4>
              <p className="text-gray-600 text-sm mt-1">
                All your health data is encrypted and stored securely in compliance with HIPAA regulations. We never share your personal information with third parties without your explicit consent.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">How accurate is the AI assistant?</h4>
              <p className="text-gray-600 text-sm mt-1">
                Our AI assistant provides information based on current medical knowledge and guidelines for diabetes and obesity management. However, it should not replace advice from healthcare professionals.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Can I use OpenHanna AI with my doctor?</h4>
              <p className="text-gray-600 text-sm mt-1">
                Yes! You can download and share your health reports with your healthcare provider to help them better understand your health patterns between visits.
              </p>
            </div>
          </div>
          <a href="#" className="block mt-4 text-blue-600 text-sm font-medium">View all FAQs</a>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Contact Support</h3>
          <p className="text-gray-600 mb-4">
            Having trouble with the platform? Our support team is here to help.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="">Select a topic</option>
                <option value="account">Account Issues</option>
                <option value="ai">AI Assistant</option>
                <option value="data">Data & Tracking</option>
                <option value="care-plan">Care Plan</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea 
                className="w-full p-2 border border-gray-300 rounded-md" 
                rows={4}
                placeholder="Describe your issue or question"
              ></textarea>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Send Message
            </button>
          </div>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="#" className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-start">
              <HelpCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-800">User Guide</h4>
                <p className="text-gray-600 text-sm">Learn how to use all features</p>
              </div>
            </a>
            <a href="#" className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-start">
              <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-800">Privacy Guide</h4>
                <p className="text-gray-600 text-sm">Understand your data rights</p>
              </div>
            </a>
            <a href="#" className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-start">
              <Bell className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-800">Notifications</h4>
                <p className="text-gray-600 text-sm">Configure your reminders</p>
              </div>
            </a>
            <a href="#" className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-start">
              <Settings className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-800">Account Setup</h4>
                <p className="text-gray-600 text-sm">Optimize your experience</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Profile</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
        <button
          onClick={() => signOut()}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-64 border-b md:border-b-0 md:border-r border-gray-200">
            <nav className="p-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center p-3 mb-1 rounded-lg text-left ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="h-5 w-5 mr-3" />
                <span>Personal Information</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center p-3 mb-1 rounded-lg text-left ${
                  activeTab === 'settings'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="h-5 w-5 mr-3" />
                <span>Account Settings</span>
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center p-3 mb-1 rounded-lg text-left ${
                  activeTab === 'privacy'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Shield className="h-5 w-5 mr-3" />
                <span>Privacy & Security</span>
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className={`w-full flex items-center p-3 mb-1 rounded-lg text-left ${
                  activeTab === 'support'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <HelpCircle className="h-5 w-5 mr-3" />
                <span>Help & Support</span>
              </button>
            </nav>
          </div>
          <div className="flex-1 p-6">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'settings' && renderSettingsTab()}
            {activeTab === 'privacy' && renderPrivacyTab()}
            {activeTab === 'support' && renderSupportTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;