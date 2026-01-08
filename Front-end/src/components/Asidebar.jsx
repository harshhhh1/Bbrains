import home from '../assets/Logo/aside-logo/home.svg';
import store from '../assets/Logo/aside-logo/store.svg';
import assignment from '../assets/Logo/aside-logo/assignments.svg';
import chat from '../assets/Logo/aside-logo/chats.svg';
import utilities from '../assets/Logo/aside-logo/tools.svg';
import library from '../assets/Logo/aside-logo/library.svg';
import settings from '../assets/Logo/aside-logo/settings.svg';
import './Asidebar.css';

export function Asidebar() {
    return (
        <aside>
            <div className="sec-one">
                <div className="home aside-tab">
                    <img src={home} alt="" />
                </div>
                <div className="store aside-tab">
                    <img src={store} alt="" />
                </div>
                <div className="assignment aside-tab">
                    <img src={assignment} alt="" />
                </div>
                <div className="chat aside-tab">
                    <img src={chat} alt="" />
                </div>
                <div className="utilities aside-tab">
                    <img src={utilities} alt="" />
                </div>
                <div className="library aside-tab">
                    <img src={library} alt="" />
                </div>
            </div>
            <div className="sec-two">                
                <div className="settings aside-tab">
                    <img src={settings} alt="" />
                </div>
            </div>
        </aside>
    );
}