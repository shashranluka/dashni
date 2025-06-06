import dataAbout from "../../data/aboutData/aboutVideos.json";

export default function AboutGame() {
  console.log(dataAbout);
  return (
    <div className="about">
      <div className="">
        {dataAbout.map((data,index) => (
          <div className="about_part">
            <div className="header">
              {data.h1 ? (
                <h1>{data.h1}</h1>
              ) : data.h2 ? (
                <h2>{data.h2}</h2>
              ) : data.h3 ? (
                <h3>{data.h3}</h3>
              ) : null}
            </div>
            {/* <img src="public/about-idea/about-idea-1.jpg" alt="" /> */}
            {/* <img src="1.jpg" alt="" />
            <img src="photos_about/2.png" alt="" />
            <img src="photos_about/1.jpg" alt="" />
            <img src="about_idea/1.jpg" alt="" /> */}
            <div className="">
              <img src={data.pic} alt="" />
              {/* <img src={data.pic} alt="" /> */}
            </div>
            <div className="">
              <p>{data.p}</p>
            </div>
          </div>
        ))}
      </div>
      {/* <div className="about_part">
        <h1>თამაშის შესახებdwaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</h1>
        <p>
          ეს ინგლისური ენის სასწავლი თამაშია, რომელიც რამდენიმე ეტაპადაა
          დაყოფილი. სათამაშოდ სიტყვების მნიშვნელობის გამოცნობა მოგიწევთ.
          , წინადადებების
          შედგენა და სასვენი ნიშნების დასმა. თამაშში არსებული ეტაპების გავლა
          შესაძლებელია როგორც ცალ-ცალკე, ასევე მიმდევრობით. Ეტაპების ცალკე
          გასავლელად დააჭირეთ ზემოთ მარჯვენა კუთხეში განლაგებულ შესაბამის
          ღილაკებს. Მიმდევრობით გავლის შემთხვევაში, შედეგები დაჯამდება.
        </p>
      </div>
      <div className="about_part">
        <h2>S: მახასიათებლები.</h2>
        <img src="photos_about/2.jpg" alt="" />
        <p>
          უნდა აირჩიოთ თამაშის სირთულე ღილაკებზე დაჭერით. Ნაწილს აწერია
          “მარტივი”, ნაწილს - “რთული”. Ქვემოთ გამოსახულია ბარათების ნიმუშები იმ
          ფორმით, რომლითაც პირველ თამაშში შეგხვდებათ. თამაშის დასაწყებად უნდა
          დააჭიროთ ღილაკს "დაწყება".
        </p>
      </div>
      <div className="about_part">
        <h2>I: ლექსიკონი.</h2>
        <img src="photos_about/3.jpg" alt="" />
        <p>
          ეს ეტაპი სიტყვების და მათი თარგმანების შესაბამებაზეა. ერთ მხარეს
          ბარათებზე განლაგებულია უცხო სიტყვები, მეორე მხარეს კი მათი თარგმანები.
          Თუ მანამდე მახასიათებლებში “მარტივს” აირჩევთ, მარჯვენა მხარეს ბარათზე
          ეწერება სიტყვაც და თარგმანიც. “Რთულის” შემთხვევაში, მხოლოდ თარგმანი.
          Მარჯვნივ ორივე შემთხვევაში მხოლოდ სიტყვა. უნდა დააჭიროთ სიტყვას და
          შემდეგ შესაბამის თარგმანს, ან პირიქით. სწორად არჩევის შემთხვევაში
          მოგემატებათ ქულაც და ცდაც, არჩეული ბარათები კი გაქრება. Არასწორად
          შესაბამების შემთხვევაში მხოლოდ ცდის რაოდენობა მოიმატებს. ბარათების
          ამოწურვის შემდეგ გამოჩნდება ღილაკი “შემდეგი ეტაპი”, რომელზე დაჭერითაც
          შეგიძლიათ თამაში შედეგის განულების გარეშე განაგრძოთ.
        </p>
      </div>
      <div className="about_part">
        <h2>II: წინადადებები</h2>
        <img src="photos_about/4.jpg" alt="" />
        <p>
          Ამ ეტაპზე მოცემულია წინადადებების თარგმანები, ასევე ბარათები, რომლებიც
          სიტყვებით უნდა შეივსოს. Ქვემოთ მოცემული შემთხვევითად დალაგებულ
          სიტყვებს დააჭირეთ ისეთი თანმიმდევრობით რომ თარგმანის შესაბამისი
          წინადადება სწორად აიწყოს. Წინადადების აწყობის შემდეგ გამოჩნდება ღილაკი
          “შემდეგი”, რომელზე დაჭერითაც შემდეგ წინადედაბაზე გადახვალთ. Ოთხი
          წინადადების შედგენის შემთხვევაში, შემდეგ ეტაპზე გადასვლას შედეგების
          განულების გარეშე შეძლებთ.
        </p>
      </div>
      <div className="about_part">
        <h2>III: სასვენი ნიშნები</h2>
        <img src="photos_about/5.jpg" alt="" />
        <p>
          ერთ მხარეს ბარათებით შედგენილი წინადადებები, სასვენი ნიშნების გარეშე,
          მეორე მხარეს კი სასვენი ნიშნები. აირჩიეთ სასვენი ნიშანი და შემდეგ
          აირჩიეთ სიტყვა რომლის შემდეგაცაა ჩასასმელი შესაბამისი სასვენი ნიშანი.
        </p>
      </div>
      <div className="about_part">
        <h2>IV: სურათის გამოცნობა</h2>
        <img src="photos_about/6.jpg" alt="" />
        <p>
          ზემოთ მოცემულია სურათი, რომელსაც ქვემოთ დაწერილი წინადადებებიდან
          ერთ-ერთი შეესაბამება. თქვენ უნდა დააჭიროთ შესაბამის წინადადებას.
          სწორად არჩევის შემთხვევაში გამოჩნდება შემდეგი სურათი, ან შემდეგ ეტაპზე
          გადასასვლელი ღილაკი.
        </p>
      </div>
      <div className="about_part">
        <h2>V: სურათის აღწერა</h2>
        <img src="photos_about/7.jpg" alt="" />
        <p>
          ზემოთ მოცემულია სურათი, რომლის შესაბამისი წინადადება ქვემოთ
          შემთხვევითად გაფანტული სიტყვებით უნდა შეადგინოთ. შედგენის შემდეგ უნდა
          გადახვიდეთ შემდეგ სურათზე. სურათების ამოწურვის შემდეგ შემდეგ ეტაპზე
          გადასასვლელი ღილაკი გამოჩნდება.
        </p>
      </div>
      <div className="about_part">
        <h2>R: შედეგები</h2>
        <img src="photos_about/R.jpg" alt="" />
        <p>
          Აქ ბოლო ეტაპის(ახლა სურათის აღწერაა ასეთი) გავლის შემდეგ მიღებული
          შედეგები და წინადედაბები, მათ თარგმანებთან ერთად გამოჩნდება.
        </p>
      </div> */}
    </div>
  );
}
