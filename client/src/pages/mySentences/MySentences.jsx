import React, { useState, useRef, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import "./MySentences.scss";
import getCurrentUser from "../../utils/getCurrentUser";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { toppings } from "../../utils/toppings";

function MySentences() {
  const [something, setSomething] = useState();
  const currentUser = getCurrentUser();
  const queryClient = useQueryClient();

  const [checkedState, setCheckedState] = useState([]);
  const [checkedAll, setCheckedAll] = useState(false);
  const [chosenClass, setChosenClass] = useState([]);
  const [chosenClassIndex, setChosenClassIndex] = useState();

  const { isLoading: classLoading, error: classError, data: classData } = useQuery({
    queryKey: ["classes"],
    refetchOnWindowFocus: false,
    queryFn: () =>
      newRequest.get(`/classes?userId=${currentUser._id}`).then((res) => {
        return res.data;
      }),
  });
  const { isLoading: sentenceLoading, error: sentenceError, data: sentenceData } = useQuery({
    queryKey: ["sentences"],
    refetchOnWindowFocus: false,
    queryFn: () =>
      newRequest.get(`/sentences?userId=${currentUser._id}`).then((res) => {
        return res.data;
      }),
  });
  // const [data1,data2] = useQueries([
  //   {
  //     queryKey: ["classes"],
  //     refetchOnWindowFocus: false,
  //     queryFn: () =>
  //       newRequest.get(`/classes?userId=${currentUser._id}`).then((res) => {
  //         return res.data;
  //       })
  //   },
  //   {
  //     queryKey: ["sentences"],
  //     refetchOnWindowFocus: false,
  //     queryFn: () =>
  //       newRequest.get(`/sentences?userId=${currentUser._id}`).then((res) => {
  //         return res.data;
  //       })
  //   }
  // ]);
  const loadingRef = useRef(true);
  if (!sentenceLoading && loadingRef.current) {
    loadingRef.current = false;
    setCheckedState(new Array(sentenceData.length).fill(false))
  }

  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.delete(`/sentences/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
    },
  });

  const handleDelete = (id) => {
    mutation.mutate(id);
  };
  // ////////////////////////////////////////////////

  // const [checkedState, setCheckedState] = useState(
  //   new Array(5).fill(false)
  // );
  const [total, setTotal] = useState(0);

  // const handleOnChange = (position) => {
  //   const updatedCheckedState = checkedState.map((item, index) =>
  //     index === position ? !item : item
  //   );
  // }

  const handleOnChange = (position) => {
    const updatedCheckedState = checkedState.map((item, index) => {
      return index === position ? !item : item
    }

    );

    setCheckedState(updatedCheckedState);

    const totalPrice = updatedCheckedState.reduce(
      (sum, currentState, index) => {

        if (currentState === true) {
          return sum + sentenceData[index].price;
        }
        return sum;
      },
      0
    );

    setTotal(totalPrice);
  };

  // function handleAdd() {
  //   // const chosenForShare = checkedState.map((item,index)=>{
  //   //   if(item){
  //   //     return index
  //   //   }else{
  //   //     return 
  //   //   }
  //   // })
  //   // const chosenForShare = checkedState.reduce((a, c, i) => {
  //   //   if (c) {
  //   //     a.push(data[i]._id);
  //   //   }
  //   //   return a;
  //   // }, []);
  //   const test = {
  //     userId: currentUser._id,
  //     name: "first class"
  //   }
  //   newRequest.post(`/classes`, test).then((res => console.log(res)))
  // }
  function classClickHandler(gig,index) {
    setChosenClassIndex(index)
    setChosenClass(gig)
  }
  function handleSubmit() {
    // checkedState-დან მონიშნული წინადადებების ID-ებს ერთად კრებს
    const sentences = checkedState.reduce((a, c, i) => {
      if (c) {
        a.push(sentenceData[i]._id);
      }
      return a;
    }, []);
    const userId = currentUser._id;
    const classId = chosenClass._id;

    console.log("submit", sentences, chosenClass,"chosenClass",currentUser._id);
    // მონიშნული კლასის update 
    const type = "sentences"
    newRequest.put(`/classes/single/${classId}`, { type, sentences, userId }).then((res => console.log(res)))
  }

  function handleChangAll() {
    const updatedAllState = checkedState.map((item, index) => !checkedAll)
    setCheckedState(updatedAllState)
    setCheckedAll(!checkedAll)
  }

  // ////////////////////////////////////////////////
  return (
    <div className="container">
      <div className="classes">
        {classLoading ? (
          "loading"
        ) : classError ? (
          "error"
        ) : (
          <div className="classes-to-choose">
            {classData.map((gig, index) =>
              <div className={chosenClassIndex == index ? "classroom-card chosen-class" : "classroom-card"}
                onClick={() => classClickHandler(gig,index)}>{gig.name}</div>)}
          </div>
        )}
      </div>
      {sentenceLoading ? (
        "loading"
      ) : sentenceError ? (
        "error"
      ) : (
        <div className="sentences-table">
          {/* <div className="add-button">
            <button onClick={() => handleAdd()}>
              დამატება
            </button>
          </div> */}
          <div className="submit-button">
            <button onClick={() => handleSubmit()}>
              Submit
            </button>
          </div>
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
              <td>
                <input type="checkbox" className="checkbox"
                  onChange={() => handleChangAll()}
                // onChange={e => {
                //   gig.isChecked = false
                //   console.log("dwafscd",gig.isChecked)
                //   setSomething(e.target.checked)}} 
                />
              </td>
              <th>სურათი</th>
              <th>ტექსტი</th>
              {/* <th>Price</th>
              <th>Sales</th> */}
              <th>წაშლა</th>
            </tr>
            {sentenceData.map((gig, index) => (
              <tr key={gig._id}>
                <td>
                  <input type="checkbox" className="checkbox" checked={checkedState[index]}
                    onChange={() => {
                      // console.log("ischecked?", checkedState[index])
                      handleOnChange(index)
                    }}
                  // onChange={e => {
                  //   gig.isChecked = false
                  //   console.log("dwafscd",gig.isChecked)
                  //   setSomething(e.target.checked)}} 
                  />
                </td>
                <td>
                  {/* <img className="image" src={gig.cover} alt="" /> */}
                </td>
                {/* <td>
                  <Link to={`/gig/${gig._id}`}>{gig.originalSentence}</Link>
                </td> */}
                <td>{gig.translation}</td>
                {/* <td>{gig.name}</td>
                <td>{gig.sales}</td> */}
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
      )}
    </div>
  );
}

export default MySentences;
