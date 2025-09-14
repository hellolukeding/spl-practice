import AppContainer from "@/components/app-container";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Menubar,
    MenubarMenu,
    MenubarTrigger
} from "@/components/ui/menubar";
import { Separator } from "@/components/ui/separator";
import { IconRefresh } from "@tabler/icons-react";
interface BillingProps { }

const Billing: React.FC<BillingProps> = (props) => {
    return (
        <AppContainer>
            <section className="w-full h-full flex flex-col items-center justify-center px-4">
                <img src="/imgs/battery.png" alt="" className="w-20 rounded-2xl" />
                <Card className="w-full mt-4 border-0 shadow-none">
                    <CardHeader>
                        <CardTitle>余额</CardTitle>
                        <CardDescription>
                            <p className="flex items-center gap-2">
                                <b className="text-xl ">{"1234.567"}</b>
                                <IconRefresh className="h-4 w-4 " />
                            </p>
                        </CardDescription>

                        <CardAction>
                            <Button variant="outline">提现</Button>
                        </CardAction>

                    </CardHeader>
                </Card>

                <Separator />

                <Card className="w-full border-0 shadow-none">
                    <CardHeader>
                        <CardTitle>交易记录</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Menubar className="border-0 shadow-none">
                            <MenubarMenu>
                                <MenubarTrigger>所有</MenubarTrigger>
                            </MenubarMenu>
                            <MenubarMenu>
                                <MenubarTrigger>铸造</MenubarTrigger>
                            </MenubarMenu>
                            <MenubarMenu>
                                <MenubarTrigger>购买</MenubarTrigger>
                            </MenubarMenu>
                            <MenubarMenu>
                                <MenubarTrigger>打赏</MenubarTrigger>
                            </MenubarMenu>
                            <MenubarMenu>
                                <MenubarTrigger>提现</MenubarTrigger>
                            </MenubarMenu>
                            <MenubarMenu>
                                <MenubarTrigger>空投</MenubarTrigger>
                            </MenubarMenu>
                        </Menubar>
                    </CardContent>
                </Card>
            </section>
        </AppContainer>
    );
};

export default Billing;
