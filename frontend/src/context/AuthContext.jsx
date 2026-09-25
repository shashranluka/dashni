import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import newRequest from "../utils/newRequest";
import { AuthContext } from "./auth-context";

// ავტორიზაციის ერთადერთი წყარო მთელ აპლიკაციაში.
//
// აქამდე მომხმარებლის მონაცემები localStorage-ში ინახებოდა, სერვერთან შემოწმების
// გარეშე. ეს ნიშნავდა, რომ ვადაგასული cookie-ს შემთხვევაშიც კი ინტერფეისი
// „შესულს" აჩვენებდა, ხოლო როლი შესვლის მომენტში იყო ჩაქეშილი — უფლების
// ჩამორთმევა ხელახლა შესვლამდე არ აისახებოდა.
//
// ახლა წყარო სერვერია: /auth/me ერთხელ გამოიძახება და შედეგს ყველა კომპონენტი
// იზიარებს.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // loading აუცილებელია: მის გარეშე guard-ები პირველ რენდერზე მომხმარებელს
  // გაუმართლებლად გარეთ გააგდებდნენ, სანამ /auth/me პასუხს დააბრუნებდა.
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await newRequest.get("/auth/me");
      setUser(res.data);
      return res.data;
    } catch {
      // 401 ნიშნავს უბრალოდ იმას, რომ სტუმარია — ეს შეცდომა არაა.
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await newRequest.post("auth/logout");
    } finally {
      // სერვერზე გასვლა თუ ვერ მოხერხდა, ლოკალურად მაინც ვასუფთავებთ.
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
