import React, {useEffect, useState} from "react";
import "./MyClass.scss";
// import { Slider } from "infinite-react-carousel/lib";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Reviews from "../../components/reviews/Reviews";

function MyClass() {
  const [sentences, setSentences] = useState()
  const { id } = useParams();
  console.log(id,"aidi")

  const { isLoading: isLoadingClass, error, data: classData } = useQuery({
    queryKey: ["gig"],
    queryFn: () =>
      newRequest.get(`/classes/single/${id}`).then((res) => {
        console.log(res.data);
        return res.data;
      }),
  });
  console.log("data",classData)
  const userId = classData?.userId;

  const {
    isLoading: isLoadingUser,
    error: errorUser,
    data: dataUser,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () =>
      newRequest.get(`/users/${userId}`).then((res) => {
        return res.data;
      }),
    enabled: !!userId,
  });
  console.log("datauser", dataUser)



  useEffect(() => {
    console.log("useEffect",isLoadingClass,classData)
    // if(!isLoadingClass){
    //   const Ids = classData.sentences
    //   newRequest
    //     .get(`/sentences`, {
    //       params: {
    //         Ids,
    //       },
    //     })
    //     .then((res) => {
    //       console.log("დაბრუნდა", res);
    //       setSentences(res.data)
    //       // setGameData({
    //       //   wordsFromLexicon: res.data,
    //       //   chosenSentences: chosenSentences,
    //       //   wordsFromSentences: wordsToTranslate,
    //       // });
    //       console.log("დაბრუნდა", res);
    //       // setGameDataCollected(true);
    //     });
    // }
  },[isLoadingClass])

  console.log(sentences)

  return (
    <div className="">
      {isLoadingClass ? (
        "loading"
      ) : error ? (
        "Something went wrong!"
      ) : (
        <div className="container">
          {classData[1].map((sentenceData,index)=>(
            <div className="sentence-div">{sentenceData.sentence}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyClass;
