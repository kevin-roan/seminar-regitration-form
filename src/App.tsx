import "./App.css";
import { useState, ChangeEvent, FormEvent } from "react";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import poster from "./assets/poster.jpeg";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
});

export const analytics = getAnalytics(app);
export const db = getFirestore(app);

interface FormData {
  fullName: string;
  mobilenumber: string;
  email: string;
  qualification: string;
  foodType: string;
  age: string;
}

const App = () => {
  const [paymentId, setPaymentId] = useState<string | undefined>();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    mobilenumber: "",
    email: "",
    qualification: "Other",
    foodType: "",
    age: "",
  });

  console.log(paymentId);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors({
        ...errors,
        email: "Please enter a valid email address",
      });
      return;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.mobilenumber)) {
      setErrors({
        ...errors,
        mobilenumber: "Please enter a 10-digit mobile number",
      });
      return;
    }
    handlePayment();
  };

  const handleUserdata = async () => {
    try {
      const docRef = await addDoc(collection(db, "userdata"), {
        createdAt: serverTimestamp(),
        username: formData.fullName,
        phonenumber: formData.mobilenumber,
        email: formData.email,
        qualification: formData.qualification,
        foodType: formData.foodType,
        age: formData.age,
      });
      console.log("Data Successfully submitted", docRef.id);
    } catch (error) {
      console.error("Error saving Data", error);
    }
  };

  const handlePayment = () => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      key_secret: import.meta.env.VITE_RAZORPAY_KEY_SECRET,
      amount: 9900,
      currency: "INR",
      name: "Adacode Solutions",
      description: "Future in commerce program",
      handler: function (response: any) {
        alert("Payment Successful: " + response.razorpay_payment_id);
        setPaymentId(response.razorpay_payment_id);
        handleUserdata();
      },
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.mobilenumber,
      },
      notes: {
        address: "Razorpay Corporate office",
      },
      theme: {
        color: "#4A669C",
      },
    };
    const pay = new (window as any).Razorpay(options);
    pay.open();
  };

  return (
    <div className="container">
      <h1 className="heading">Future in Commerce</h1>
      <p className="para">Registration Portal</p>
      <img src={poster} alt="poster1" />
      <h4 className="form-heading">Please fill this form</h4>
      <form onSubmit={handleSubmit}>
        <input
          className="textinput"
          type="text"
          name="fullName"
          onChange={handleInputChange}
          required
          value={formData.fullName}
          placeholder="Enter your name"
        />
        <input
          className="textinput"
          type="text"
          name="age"
          onChange={handleInputChange}
          required
          value={formData.age}
          placeholder="Age"
        />
        <select
          className="qualification"
          name="qualification"
          onChange={handleInputChange}
          value={formData.qualification}
        >
          <option value="Plus Two">Plus Two</option>
          <option value="ITI or Diploma">ITI or Diploma</option>
          <option value="Graduate">Graduate</option>
          <option value="Masters">Masters</option>
          <option value="Other">Other</option>
        </select>
        <input
          className="textinput"
          type="text"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email"
        />
        {errors.email && <p className="error">{errors.email}</p>}
        <input
          className="textinput"
          type="tel"
          name="mobilenumber"
          value={formData.mobilenumber}
          onChange={handleInputChange}
          placeholder="Phone Number"
        />
        <br/>
        {errors.mobilenumber && <p className="error">{errors.mobilenumber}</p>}
        <label className="form-heading">Preferred food type</label>
        <div className="foodtypewrapper">
          <label className="label_wrapper">
            Vegetarian
            <input
              type="radio"
              name="foodType"
              value="Vegetarian"
              checked={formData.foodType === "Vegetarian"}
              onChange={handleInputChange}
            />
          </label>
          <label className="label_wrapper">
            Non-Vegetarian
            <input
              type="radio"
              name="foodType"
              value="Non-Vegetarian"
              checked={formData.foodType === "Non-Vegetarian"}
              onChange={handleInputChange}
            />
          </label>
        </div>
        <h4 className="feeinfo">Entry Fee: Rs. 99 Only</h4>
        <p className="info">
          To participate in our upcoming seminar an entry fee of 99 Rupees will
          be charged. Secure your spot today to gain valuable insights and
          knowledge from our expert speakers.
        </p>
        <input className="paybutton" type="submit" value="Pay and Proceed" />
      </form>
      <p className="info">*Secure Payment with Razorpay</p>
    </div>
  );
};

export default App;
