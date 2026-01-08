import { Header } from "../../components/Header";
import { Asidebar } from "../../components/Asidebar";
import { ProfileCard } from "./ProfileCard";
import './HomePage.css';

export function HomePage() {
    return(
        <>
            <Header/>
            <Asidebar/>
            <ProfileCard/>
        </>
    );
}