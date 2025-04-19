import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./MyRoom.scss";
import getCurrentUser from "../../utils/getCurrentUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

function MyRoom() {
  const [addSpaceState, setAddSpaceState] = useState(false);
  const [addStudentSpaceState, setAddStudentSpaceState] = useState(false);
  const [students, setStudents] = useState([]);
  const [nameOfClass, setNameOfClass] = useState();
  const [nameOfStudent, setNameOfStudent] = useState();
  const [chosenClassIndex, setChosenClassIndex] = useState();
  const [chosenClass, setChosenClass] = useState();
  const [showClasses, setShowClasses] = useState(false);
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
      newRequest.get(`/classes?userId=${currentUser._id}`).then((res) => {
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

  const handleDelete = (id) => {
    mutation.mutate(id);
  };

  function classClickHandler(gig, index) {
    setChosenClassIndex(index)
    setChosenClass(gig)
  }
  function handleAdd() {
    const test = {
      userId: currentUser._id,
      name: nameOfClass
    }
    // console.log("add");
    newRequest.post(`/classes`, test).then((res => console.log(res)))
    setInterval(() => window.parent.location = window.parent.location.href, 5000)
  }
  function handleAddStudent() {
    setStudents([...students, nameOfStudent])
  }
  function handleStudentsSubmit() {
    const userId = currentUser._id;
    // console.log(chosenClass,"currentUser",currentUser)
    const classId = chosenClass._id;
    const type = "students"

    // newRequest.put(`/classes/single/${classId}`, { type, students, userId }).then((res => console.log(res)))
    newRequest.put(`/classes/single/${classId}`, { type, students, userId }).then((res => console.log(res)))
  }
  console.log(students, chosenClass, currentUser, "current User")
  return (
    <div className="myRoom">
      <Link to="/mysentences">
        <div className="shelf-button">
          წინადადებები
        </div>
      </Link>
      <Link to="/myvideos">
        <div className="shelf-button">
          ვიდეოები
        </div>
      </Link>

      <div className="">
        <div className="">
          <button className="shelf-button" onClick={() => setAddSpaceState(!addSpaceState)}>
            საკლასო ოთახის შექმნა {addSpaceState ? " ▼" : " ▶"}
          </button>
        </div>
        {addSpaceState ?
          (<div className="">
            <div className="form">
              <input type="text" name="nameOfClass" onChange={(e) => setNameOfClass(e.target.value)} />
            </div>
            <div className="add-button">
              <button onClick={() => handleAdd()}>
                დამატება
              </button>
            </div>
          </div>) : (
            <div className=""></div>
          )
        }
      </div>

      <div className="">
        <div className="">
          <button className="shelf-button" onClick={() => setShowClasses(!showClasses)}>
            კლასები {showClasses ? " ▼" : " ▶"}
          </button>
        </div>
        {showClasses && (
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
        )}
      </div>

      <div className="">
        <div className="">
          <button className="shelf-button" onClick={() => setAddStudentSpaceState(!addStudentSpaceState)}>
            კლასში მოსწავლეების დამატება {addStudentSpaceState ? " ▼" : " ▶"}
          </button>
        </div>
        {addStudentSpaceState ?
          (<div className="">
            <div className="form">
              <input type="text" name="nameOfClass"
                onChange={(e) => setNameOfStudent(e.target.value)} />
            </div>
            <div className="add-button">
              <button onClick={() => handleAddStudent()}>
                +
              </button>
            </div>
            <div className="">
              <h3>დასამატებელი მოსწავლეები</h3>
              {students.map((studentName) => (
                <div className="">{studentName}</div>
              ))}
              <div className="">
                <button onClick={handleStudentsSubmit}>დაამატე მოსწავლეები</button>
              </div>
            </div>
          </div>) : (
            <div className=""></div>
          )
        }
      </div>

      {/* {isLoading ? (
        "loading"
      ) : error ? (
        "error"
      ) : (
        <div className="container">
          <div className="title">
            <h1>Gigs</h1>
            {currentUser.isSeller && (
              <Link to="/add">
                <button>Add New Gig</button>
              </Link>
            )}
          </div>
          <table>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Price</th>
              <th>Sales</th>
              <th>Action</th>
            </tr>
            {data.map((gig) => (
              <tr key={gig._id}>
                <td>
                  <img className="image" src={gig.cover} alt="" />
                </td>
                <td>
                  <Link to={`/gig/${gig._id}`}>{gig.title}</Link>
                </td>
                <td>{gig.price}</td>
                <td>{gig.sales}</td>
                <td>
                  <img
                    className="delete"
                    src="./img/delete.png"
                    alt=""
                    onClick={() => handleDelete(gig._id)}
                  />
                </td>
              </tr>
            ))}
          </table>
        </div>
      )} */}
    </div>
  );
}

export default MyRoom;
