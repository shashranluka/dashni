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

  console.log("start")
  const { isLoading: classLoading, error: classError, data: classData } = useQuery({
    queryKey: ["classes"],
    refetchOnWindowFocus: false,
    queryFn: () =>
      newRequest.get(`/classes?userId=${currentUser._id}`).then((res) => {
        console.log("clasebi mova", res)
        return res.data;
      }),
  });
  const { isLoading: sentenceLoading, error: sentenceError, data: sentenceData } = useQuery({
    queryKey: ["sentences"],
    refetchOnWindowFocus: false,
    queryFn: () =>
      newRequest.get(`/sentences?userId=${currentUser._id}`).then((res) => {
        console.log("winada mova", res.data)
        return res.data;
      }),
  });
  console.log(sentenceData)
  // const [data1,data2] = useQueries([
  //   {
  //     queryKey: ["classes"],
  //     refetchOnWindowFocus: false,
  //     queryFn: () =>
  //       newRequest.get(`/classes?userId=${currentUser._id}`).then((res) => {
  //         console.log("clasebi mova", res)
  //         return res.data;
  //       })
  //   },
  //   {
  //     queryKey: ["sentences"],
  //     refetchOnWindowFocus: false,
  //     queryFn: () =>
  //       newRequest.get(`/sentences?userId=${currentUser._id}`).then((res) => {
  //         console.log("clasebi mova", res)
  //         return res.data;
  //       })
  //   }
  // ]);
  console.log("dwafdß")
  const loadingRef = useRef(true);
  // console.log(isLoading)
  if (!sentenceLoading && loadingRef.current) {
    loadingRef.current = false;
    // console.log(isLoading,loadingRef)
    setCheckedState(new Array(sentenceData.length).fill(false))
  }
  // console.log(data,checkedState,loadingRef);

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
  // console.log(data);

  // const [checkedState, setCheckedState] = useState(
  //   new Array(5).fill(false)
  // );
  const [total, setTotal] = useState(0);
  // console.log(checkedState)

  // const handleOnChange = (position) => {
  //   const updatedCheckedState = checkedState.map((item, index) =>
  //     index === position ? !item : item
  //   );
  // }

  const handleOnChange = (position) => {
  console.log(sentenceData[0]._id)

    const updatedCheckedState = checkedState.map((item, index) => {

      // console.log("map", index,position,item,index === position)
      return index === position ? !item : item
    }

    );
    // console.log(updatedCheckedState)

    setCheckedState(updatedCheckedState);

    const totalPrice = updatedCheckedState.reduce(
      (sum, currentState, index) => {
        // console.log(sum,currentState,index)

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
  //   //   console.log(item,index)
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
  //   console.log("add");
  //   newRequest.post(`/classes`, test).then((res => console.log(res)))
  // }
  console.log(checkedState)
  function classClickHandler(gig) {
    setChosenClass(gig)
  }
  function handleSubmit() {
    const chosenForShare = checkedState.reduce((a, c, i) => {
      if (c) {
        console.log(sentenceData[i]._id)
        a.push(sentenceData[i]._id);
      }
      return a;
    }, []);
    const classId = chosenClass._id;
    console.log("submit", chosenForShare, classData, chosenClass);
    newRequest.put(`/classes/single/${currentUser._id}`, { share: chosenForShare, classId, classData }).then((res => console.log(res)))
  }
  useEffect(() => {
    console.log("useEffect")

  })
  function handleChangAll(){
    const updatedAllState = checkedState.map((item, index) => !checkedAll)
  console.log(updatedAllState)
  setCheckedState(updatedAllState)
    setCheckedAll(!checkedAll)
  }
  console.log(checkedState)

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
              <div className="classroom-card" onClick={() => classClickHandler(gig)}>{gig.name}</div>)}
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
                      handleOnChange(index)}}
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
