import { Mail,Bell, Smartphone, MessageSquare } from "lucide-react"
import { Switch } from "../ui/switch"
import { useEffect, useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/utils/api"
import { UnsavedModal } from "./SettingsModal"

interface ReminderSettingProps{
    hasChanged: boolean;
    setHasChanged: (value: boolean) => void
}

const ReminderSettings = ({hasChanged,setHasChanged}:ReminderSettingProps) => {

    const [modalOpen,setModalOpen] = useState(false)
    const queryClient = useQueryClient()
    
    const {data:preferences} = useQuery({
        queryKey: ["userPreferences"],
        queryFn: async () => {
            const res = await api.get("/v1/user/user-preferences");
            return res.data
          },
    })
    console.log("preferences",preferences);
    
    const [emailEnabled,setEmailEnabled] = useState<boolean>(preferences.emailEnabled ?? false)
    const [inAppEnabled,setInAppEnabled] = useState<boolean>(preferences.inAppEnabled ?? false)
    const [pushEnabled,setPushEnabled] = useState<boolean>(preferences.pushEnabled ?? false)
    const [smsEnabled,setSMSEnabled] = useState<boolean>(preferences.smsEnabled ?? false)


    const valueMap: Record<string,boolean> = {
        email:emailEnabled,
        inApp:inAppEnabled,
        mobile:pushEnabled,
        sms:smsEnabled
    }

    const setterMap: Record<string, (v:boolean) => void> = {
        email: setEmailEnabled,
        inApp: setInAppEnabled,
        mobile: setPushEnabled,
        sms: setSMSEnabled,
    }

    const computedHasChanged = useMemo(() => {
        if (!preferences) return false;
        return (
          emailEnabled !== preferences.emailEnabled ||
          inAppEnabled !== preferences.inAppEnabled ||
          pushEnabled !== preferences.pushEnabled ||
          smsEnabled !== preferences.smsEnabled
        );
      }, [
        preferences,
        emailEnabled,
        inAppEnabled,
        pushEnabled,
        smsEnabled,
      ]);
      console.log("has changed",hasChanged);
      

    useEffect(()=>{
        setHasChanged(computedHasChanged);
    },[setHasChanged,computedHasChanged])

        // Reset from parent (e.g. when switching sidebar tabs)
        useEffect(() => {
            if (!preferences) return;
            setEmailEnabled(preferences.emailEnabled);
            setInAppEnabled(preferences.inAppEnabled);
            setPushEnabled(preferences.pushEnabled);
            setSMSEnabled(preferences.smsEnabled);
            setHasChanged(false);
          }, [preferences, setHasChanged]);

    const handleDiscardAndProceed = () => {
        if(preferences.emailEnabled){
            setEmailEnabled(preferences.emailEnabled)
        }
        setHasChanged(false);
        setModalOpen(false);
    } 

    const updatePreference = async () => {
        try {
            await api.put("/v1/user/user-preferences", {
                emailEnabled,
                inAppEnabled,
                pushEnabled,
                smsEnabled,
            });
            setHasChanged(false)
            queryClient.invalidateQueries({
                queryKey:['userPreferences']
            })
        } catch (error) {
            if (preferences) {
                setEmailEnabled(preferences.emailEnabled);
                setInAppEnabled(preferences.inAppEnabled);
                setPushEnabled(preferences.pushEnabled);
                setSMSEnabled(preferences.smsEnabled);
                setHasChanged(false);
            }
        }
    };

    const methods = [
        {
            id:"email",
            title:"Emails",
            description:"Receive reminders directly in your inbox",
            icon: <Mail className="w-4 h-4"/>,
            comingSoon: false
        },
        {
            id:"inApp",
            title:"Desktop notifications",
            description:"Get alerts while using the web app",
            icon: <Bell className="w-4 h-4"/>,
            comingSoon: true
        },
        {
            id:"mobile",
            title:"Mobile notifications",
            description:"Receive alerts on your IOS or Android device",
            icon: <Smartphone className="w-4 h-4"/>,
            comingSoon: true
        },
        {
            id:"sms",
            title:"SMS messages",
            description:"Get text messages for highly time-sensitive tasks",
            icon: <MessageSquare className="w-4 h-4"/>,
            comingSoon: true
        }
    ]
    return (
        <main className='min-h-[calc(100vh-100px)] max-h-[calc(100vh-100px)] rounded-r-md font-medium overflow-y-auto bg-background relative'>
            <div className=' pl-4 py-2 pr-2 bg-background sticky top-0'>
                <h1 className="text-[16px] font-medium">Reminders</h1>
            </div>
            <div className='h-px bg-border sticky top-10'/>
            <div className="p-6 flex flex-col gap-2">
                <h1 className="text-xl font-semibold text-foreground">How would you like to get reminded?</h1>
                <p className="text-sm text-muted-foreground mb-6">Choose your preferred channels for receiving task reminders, daily digests, and important updates. We're currently working on expanding these options.</p>
                {methods.map(method => (
                    <div>
                        <div className="h-px bg-border mb-3 mt-3"/>
                        <div className={`flex justify-between gap-4 ${method.comingSoon ?'opacity-40' : ''}`}>
                            <div className={`flex gap-4 ${method.comingSoon ? 'pointer-events-none' : ''}`}>
                                <div className="rounded-full p-3 border border-border shadow-xs bg-border">
                                {method.icon}
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex gap-3">
                                        <p>{method.title}</p>
                                        {method.comingSoon && (<div className="rounded-lg p-1 border border-border text-[10px] bg-border tracking-wide uppercase">Coming Soon</div>)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{method.description}</p>
                                </div>
                            </div>
                            <div className={`flex items-center ${method.comingSoon ? 'cursor-not-allowed':''}`}>
                                <Switch disabled={method.comingSoon} checked={valueMap[method.id]} onClick={()=>setterMap[method.id](!valueMap[method.id])} />
                            </div>
                        </div>
                    </div>
                ))}
                <div className="h-px bg-border mb-3 mt-3"/>
            </div>
            {
                hasChanged && (
                    <div className="absolute bottom-0 text-[14px] font-medium pl-4 py-2 pr-2 bg-background z-10 border-t border-border shrink-0 flex justify-end gap-2 w-full">
                        <div className="flex justify-end gap-2">
                            <button className="px-3 py-2 bg-button-subtle text-button-text rounded-sm max-w-30 text-[14px] font-light hover:bg-button-subtle-hover cursor-pointer"
                            onClick={() => {
                                if(preferences.emailEnabled){
                                    setEmailEnabled(preferences.emailEnabled)
                                }
                                setHasChanged(false)
                            }}
                            >Cancel</button>
                            <button className="text-[14px] px-3 py-1.5 bg-red-500 font-light rounded-sm text-white cursor-pointer hover:bg-red-400"
                                onClick={updatePreference}
                            >Save Preferences</button>
                        </div>
                    </div>
                )
            }
            {modalOpen && (
                <UnsavedModal
                    setModalOpen={setModalOpen}
                    onDiscard={handleDiscardAndProceed}
                />
            )}

        </main>
    )
  }
  
  export default ReminderSettings