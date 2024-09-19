import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./MySchool.scss";
import getCurrentUser from "../../utils/getCurrentUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

function MySchool() {
  const [addSpaceState, setAddSpaceState] = useState(false);
  const [addStudentSpaceState, setAddStudentSpaceState] = useState(false);
  const [students, setStudents] = useState([]);
  const [nameOfClass, setNameOfClass] = useState();
  const [nameOfStudent, setNameOfStudent] = useState();
  const [chosenClassIndex, setChosenClassIndex] = useState();
  const [chosenClass, setChosenClass] = useState();
  const currentUser = getCurrentUser();
  console.log(currentUser);
  const queryClient = useQueryClient();

  // const { isLoading, error, data } = useQuery({
  //   queryKey: ["myGigs"],
  //   refetchOnWindowFocus: false,
  //   queryFn: () =>
  //     newRequest.get(`/gigs?userId=${currentUser._id}`).then((res) => {
  //       console.log(res.data);
  //       return res.data;
  //     }),
  // });
  const { isLoading: classLoading, error: classError, data: classData } = useQuery({
    queryKey: ["classes"],
    refetchOnWindowFocus: false,
    queryFn: () =>
      newRequest.get(`/classes?userId=${currentUser._id}`,{
        params: {
          type:"student"
        },
      }).then((res) => {
        // console.log("clasebi mova", res)
        return res.data;
      }),
  });
  console.log(classData, "dwadwac,znxa,n,mxaxm");

  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.delete(`/gigs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
    },
  });

  function classClickHandler(gig, index) {
    setChosenClassIndex(index)
    setChosenClass(gig)
  }

  console.log(students,chosenClass,currentUser,"current User")
  return (
    <div className="myRoom">
      <div className="classes">
        {classLoading ? (
          "loading"
        ) : classError ? (
          "error"
        ) : (
          <div className="">
            {classData.map((gig, index) =>
              <div className="class-box">
                <div className={chosenClassIndex == index ? "classroom-card chosen-class" : "classroom-card"}
                  onClick={() => classClickHandler(gig, index)}>{gig.name}</div>
                <Link to={`/myClass/${gig._id}`}>
                  <div className="class-link">გადასვლა</div>
                </Link>
              </div>)}
          </div>
        )}
      </div>
    </div>
  );
}

export default MySchool;
