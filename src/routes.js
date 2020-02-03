import React from 'react';
import {Route, BrowserRouter as Router} from 'react-router-dom'
import Home from './components/views/home';
import Problem from './components/views/Problem';
import Solution from "./components/views/Solution";
import ProblemSet from "./components/views/ProblemSet";
import Train from "./components/views/Train";
import Submission from "./components/views/Submission";
import NewProblem from "./components/views/NewProblem";
import EditProblem from "./components/views/EditProblem";
import NewSet from "./components/views/NewSet";

export default (
    <Router>
        <Route exact path='/' component={Home}/>
        <Route exact path={'/problem/:id'} component={Problem}/>
        <Route exact path={'/set/:set/problem/:id'} component={Problem}/>
        <Route path={'/solution/:id'} component={Solution}/>
        <Route path={'/problem-set/:id'} component={ProblemSet}/>
        <Route path={'/train'} component={Train}/>
        <Route path={'/submission/:id'} component={Submission}/>
        <Route path={'/new/problem'} component={NewProblem}/>
        <Route path={'/new/set'} component={NewSet}/>
        <Route path={'/edit/problem/:id'} component={EditProblem}/>
    </Router>
);