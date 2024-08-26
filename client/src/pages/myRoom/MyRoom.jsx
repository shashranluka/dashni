import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./MyRoom.scss";
import getCurrentUser from "../../utils/getCurrentUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

function MyRoom() {
  const [addSpaceState, setAddSpaceState] = useState(false)
  const [nameOfClass, setNameOfClass] = useState()
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

  function handleClick() {
    // console.log("click,კლიკი")
  }
  function handleAdd() {
    const test = {
      userId: currentUser._id,
      name: nameOfClass
    }
    // console.log("add");
    newRequest.post(`/classes`, test).then((res => console.log(res)))
  }

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
              <div className="">{
                <Link to={`/myClass/${gig._id}`}>
                  <div className="class-box" onClick={() => handleClick(index)}>
                    {gig.name}
                  </div>
                </Link>
              }</div>)}
          </div>
        )}
      </div>
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
          <button className="show-space-button" onClick={() => setAddSpaceState(!addSpaceState)}>{addSpaceState ? ("-") : ("+")}</button>
          <label>
            საკლასო ოთახის შექმნა
          </label>
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
