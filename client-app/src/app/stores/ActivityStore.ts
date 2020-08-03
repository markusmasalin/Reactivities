import {observable, action, computed, runInAction} from 'mobx';
import { createContext, SyntheticEvent } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';


class ActivityStore {
    @observable activityRegistry = new Map();
    @observable activity: IActivity | null = null;
    @observable loadingInitial = false;
    @observable submitting = false;
    @observable target = '';

    @computed get activitiesByDate() {
        return Array.from(this.activityRegistry.values()).sort(
            (a, b) => Date.parse(a.date) - Date.parse(b.date));
    }

    @action loadActivities = async() => {
        this.loadingInitial = true;
        try {
            const activities = await agent.Activities.list();
            runInAction('loading activities',() => {
                activities.forEach(activity => {
                    activity.date = activity.date.split('.')[0];
                    this.activityRegistry.set(activity.id, activity);
                    
                })
                this.loadingInitial = false;
            });
           

        } catch(error) {
            runInAction('load activities error',() => {
                
                this.loadingInitial = false;
            })
            console.log(error);
        }
    }

    @action loadActivity = async (id: string) => {
        let activity = this.getActivity(id);
        if (activity){
            this.activity = activity;
        } else {
            this.loadingInitial = true;
            try {
                activity = await agent.Activities.details(id);
                runInAction('getting activity', () => {
                    this.activity = activity;
                    this.loadingInitial = false;
                })
            } catch (error) {
                console.log(error);
                runInAction('getting activity error', () => {
                    this.loadingInitial = false;
                })
            }
        }
    }

    @action clearActivity = () => {
        this.activity = null;
    }

    getActivity = (id: string) => {
        return this.activityRegistry.get(id);
    }

    @action createActivity = async(activity: IActivity) => {
        this.submitting = true;

        try {
            await agent.Activities.create(activity);
            runInAction('creating activity', () => {
                this.activityRegistry.set(activity.id, activity);
                this.submitting = false;
            })
           
        } catch(error) {
            console.log(error);
            runInAction('creating activity error',() => {
                this.submitting = false;
            })
            
        }
    }

    @action editActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
             await agent.Activities.update(activity)
             runInAction('edit activity',() => {
                this.activityRegistry.set(activity.id, activity);
                this.activity = activity;
                this.submitting = false;
             })
             
        } catch (error) {
            runInAction('edit activity error',() => {
                this.submitting = false;
            })
            console.log(error);
        }
    }

    @action deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
        this.submitting = true;
        this.target = event.currentTarget.name;
        try {
            await agent.Activities.delete(id);
            runInAction('delete action', () => {
                this.activityRegistry.delete(id);
                this.submitting = false;
                this.target = '';
            })
            
        } catch (error) {
            runInAction('delete action error', () => {
                this.submitting = false;
                this.target = '';
            })
           
            console.log(error);
        }
       
    }

}

export default createContext(new ActivityStore());