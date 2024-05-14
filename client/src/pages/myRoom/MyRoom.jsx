import React from "react";
import { Link } from "react-router-dom";
import "./MyRoom.scss";
import getCurrentUser from "../../utils/getCurrentUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

function MyRoom() {
  const currentUser = getCurrentUser();
  console.log(currentUser);
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["myGigs"],
    refetchOnWindowFocus: false,
    queryFn: () =>
      newRequest.get(`sentences/?userId=${currentUser._id}`).then((res) => {
        console.log(res.data);
        return res.data;
      }),
  });

  // const { isLoadingRoom, error, roomData } = useQuery({
  //   queryKey: ["myGigs"],
  //   refetchOnWindowFocus: false,
  //   queryFn: () =>
  //     newRequest.get(`/videodatas?userId=${currentUser._id}`).then((res) => {
  //       console.log(res.data);
  //       return res.data;
  //     }),
  // });
  console.log(data);

  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.delete(`/sentences/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["mySentences"]);
    },
  });

  const handleDelete = (id) => {
    mutation.mutate(id);
  };

  return (
    <div className="myRoom">
      {isLoading ? (
        "loading"
      ) : error ? (
        "error"
      ) : (
        <div className="container">
          <div className="">
            <h1>სასწავლო მასალები</h1>
          </div>
          <div className="title">
            <div className=""></div>
            <div className="">
              <h2>წინადადებები</h2>
            </div>
            {currentUser.isSeller && (
              <Link to="/addvideodata">
                <button>ახალი მონაცემების დამატება</button>
              </Link>
            )}
          </div>
          <table>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Language</th>
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
                  <Link to={`/video/${gig._id}`}>{gig.sentence}</Link>
                </td>
                <td>{gig.language}</td>
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
          {/* <table>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Language</th>
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
                  <Link to={`/video/${gig._id}`}>{gig.title}</Link>
                </td>
                <td>{gig.language}</td>
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
          </table> */}
        </div>
      )}
    </div>
  );
}

export default MyRoom;
