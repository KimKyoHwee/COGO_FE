import React, { useEffect, useState } from "react";
import * as styles from "./timeselect.styles";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../../../components/button/backButton";
import { useRecoilState } from "recoil";
import { authState } from "../../../atoms/authState";
import axios from "axios";

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
}

const saveTokenToLocalStorage = (token: string) => {
  localStorage.setItem("token", token);
};

const getTokenFromLocalStorage = () => {
  return localStorage.getItem("token");
};

const TimeSelect = () => {
  const [auth, setAuth] = useRecoilState(authState);
  const token = auth.token || getTokenFromLocalStorage();
  const location = useLocation();
  const username = location.state.key;
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  useEffect(() => {
    if (token) {
      setAuth((prevAuth) => ({
        ...prevAuth,
        token,
        isLoggedIn: true,
      }));
    }
  }, [token, setAuth]);

  const handleTimeSlotClick = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };

  useEffect(() => {
    const url = `http://localhost:8080/api/v1/mentor/possibleDates/${username}`;
    fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const formedData = getFormattedTimeSlots(data);
        setTimeSlots(formedData);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [token, username]);

  const getFormattedTimeSlots = (fetchData: TimeSlot[]) => {
    const sortedData = fetchData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sortedData.map((slot: TimeSlot) => {
      const date = new Date(slot.date);
      const dayOfWeek = date.toLocaleString("ko-KR", { weekday: "short" });
      const formattedDate = date.toLocaleDateString("ko-KR");
      return `${dayOfWeek} ${formattedDate} ${slot.startTime} ~ ${slot.endTime}`;
    });
  };

  const handleSubmit = () => {
    if (!selectedTimeSlot) {
      console.error("No time slot selected");
      return;
    }
  
    // expected format: "토 2024.7.6 12:00 ~ 13:00"
    const parts = selectedTimeSlot.split(" ");
    console.log("Parts:", parts);
  
    if (parts.length < 7) {
      console.error("Selected time slot format is incorrect");
      return;
    }
  
    const [dayOfWeek, year, month, day, startTime, tilde, endTime] = parts;
  
    const date = `${year}${month}${day}`; // combine year, month, and day
  
    const dateParts = date.split(".");
    console.log("Date parts:", dateParts);
  
    if (dateParts.length < 3) {
      console.error("Date format is incorrect");
      return;
    }
  
    const [yearPart, monthPart, dayPart] = dateParts.map(part => part.replace('.', ''));
    console.log("Year:", yearPart, "Month:", monthPart, "Day:", dayPart);
  
    if (!yearPart || !monthPart || !dayPart) {
      console.error("Date parts are missing");
      return;
    }
  
    const formattedDate = `${String(yearPart).padStart(4, '0')}-${String(monthPart).padStart(2, '0')}-${String(dayPart).padStart(2, '0')}`;
    const mentorId = 1; // Example mentorId, adjust as needed
  
    const requestData = {
      date: formattedDate,
      start_time: startTime,
      end_time: endTime,
      mentor_id: mentorId,
    };
    console.log(requestData);
    axios
      .post("http://localhost:8080/api/v1/application", requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log("Successfully submitted", response.data);
      })
      .catch((error) => {
        console.error("Error submitting data", error);
      });
  };
  
  
  
  
  
  
  

  return (
    <styles.Container>
      <styles.HeaderContainer>
        <styles.ButtonContainer>
          <BackButton />
        </styles.ButtonContainer>
        <styles.HeaderText>미팅 날짜 및 시간을 맞춰주세요</styles.HeaderText>
        <styles.HeaderSubText>
          COOGH 동아리와의 미팅 시간을 선택해주세요.
        </styles.HeaderSubText>
      </styles.HeaderContainer>

      <styles.BodyContainer>
        <styles.TimeSlotContainer>
          {timeSlots.map((timeSlot, index) => (
            <styles.TimeSlotButton
              key={index}
              onClick={() => handleTimeSlotClick(timeSlot)}
              isSelected={selectedTimeSlot === timeSlot}
            >
              {timeSlot}
            </styles.TimeSlotButton>
          ))}
        </styles.TimeSlotContainer>
        <styles.ApplyButton onClick={handleSubmit}>확인하기</styles.ApplyButton>
      </styles.BodyContainer>
    </styles.Container>
  );
};

export default TimeSelect;
