import { Link } from "react-router-dom";
import "./NotFound.scss";

// ნებისმიერი მისამართი, რომელსაც route არ შეესაბამება. ამის გარეშე
// მომხმარებელი ცარიელ ეკრანს ხედავდა, მხოლოდ Navbar-ით.
function NotFound() {
  return (
    <div className="not-found">
      <h1>გვერდი ვერ მოიძებნა</h1>
      <p>შესაძლოა მისამართი შეიცვალა ან ბმული არასწორია.</p>
      <Link to="/" className="not-found__link">
        მთავარ გვერდზე დაბრუნება
      </Link>
    </div>
  );
}

export default NotFound;
