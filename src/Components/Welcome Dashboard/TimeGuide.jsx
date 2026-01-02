import React, { useState, useEffect } from "react";
import "./timeguide.css"
export default function TimeGuide() {
    const [greeting, setGreeting] = useState("");

    // Function to determine greeting based on IST time
    const getGreeting = () => {
        const now = new Date();
        // Convert to IST by adding 5 hours 30 minutes (UTC+5:30)
        const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
        const istTime = new Date(now.getTime() + istOffset);
        const hours = istTime.getUTCHours(); // Get hours in UTC (adjusted for IST)

        if (hours < 12) {
            return "🌅 Good Morning!";
        } else if (hours < 17) {
            return "☀️ Good Afternoon!";
        } else {
            return "🌙 Good Evening!";
        }

    };

    useEffect(() => {
        // Set initial greeting
        setGreeting(getGreeting());

        // Update greeting every minute
        const interval = setInterval(() => {
            setGreeting(getGreeting());
        }, 60000); // 60 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    return (
        <>

            <div className="timeguide">
                <div style={{ textAlign: "center" }}>
                    <h1 >{greeting}</h1>
                </div>
            </div>
        </>

    );
}