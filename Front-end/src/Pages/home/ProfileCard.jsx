import profilePicture from '../../assets/Images/header-icons/sachin.jpg';
import editlogo from '../../assets/logo/edit.svg';
import './ProfileCard.css';

export function ProfileCard() {
    return (
        <div className="profile-card">
            <div className="tools">
                <div className="edit-btn">
                    <img src={editlogo} alt="" />
                </div>
            </div>
            <div className="pfp">
                <img src={profilePicture} alt="" />
            </div>
            <div className="info-container">
                <div className="name">Sachin Pathak</div>
                <div className="class">BCA 3rd Year</div>
            </div>
            <div className="roles">
                <div className="role">Class Representative</div>
                <div className="role">Cousil Member</div>
                <div className="role">Rolessss</div>
                <div className="rolipoli">.......</div>
            </div>
            <div className="level-container">
                <div className="level">Level : 10</div>
                <div className="exp-bar"></div>
            </div>
        </div>
    );
}