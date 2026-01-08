import Logo from '../assets/Logo/logo.png';
import notification from '../assets/Images/header-icons/notification.svg'
import lightmode from '../assets/Images/header-icons/sun-svgrepo-com.svg'
import './Header.css';

export function Header() {
    return(
        <header>
            <div className="left-section">
                <div className="logo-container">
                    <img src={Logo} className="bb-logo" alt="logo" />
                </div>                    
            </div>
            <div className="middle-section">
                Tilak Maharashtra Vidyapeeth
            </div>
            <div className="right-section">
                <div className="toggle-mode">
                    <button className="light-mode-icon">
                        <img src={lightmode} alt="" />
                    </button>
                </div>
                <div className="Mode-icon">99999</div>
                <div className="notification-container">
                    <button className='notification-icon' >
                        <img src={notification} alt="" />
                    </button>
                    <div className="notification-count">+9</div>
                </div>
            </div>
        </header>
    );
}