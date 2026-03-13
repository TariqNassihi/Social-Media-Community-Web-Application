import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { AppContextProvider } from "./context/AppContext";
import NavBar from "./components/navbar/NavBar";
import Footer from "./components/footer/Footer";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import MyProfile from "./pages/MyProfile/MyProfile";
import MyBlogs from "./pages/MyBlogs/MyBlogs";
import MyFavourites from "./pages/MyFavourites/MyFavourites";
import Register from "./pages/Register/Register";
import BlogDetails from "./pages/BlogDetails/BlogDetails";
import News from "./pages/News/news";
import ThreadPage from "./pages/Threads/Thread";
import ThreadDetailPage from "./pages/ThreadDetails/ThreadDetails";
import Search from "./pages/Search/Search";
import Posts from "./pages/Posts/Posts";

import Profile from "./pages/Profile/Profile";

function App() {
  return (
    <React.Fragment>
      <AppContextProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/my-profile" element={<MyProfile/>} />
          <Route path="/user/:userId" element={<MyProfile/>}/>
          <Route path="/my-blogs" element={<MyBlogs/>}></Route>
          <Route path="/my-favourites" element={<MyFavourites/>}></Route>
          <Route path="/posts/:postId" element={<BlogDetails/>}/>
          <Route path="/blogs/:blogId" element={<BlogDetails />} />
          <Route path="/news" element={<News />} />
          <Route path="/Threads" element={<ThreadPage />} />
          <Route path="/search-results" element={<Search />} />
          <Route path="/followedPosts" element={<Posts />} />
          <Route
            path="/threadDetail/:threadId"
            element={<ThreadDetailPage />}
          />
          <Route path="/profile/:id" element={<Profile/>}></Route>
        </Routes>
        <Footer />
      </AppContextProvider>
    </React.Fragment>
  );
}

export default App;
