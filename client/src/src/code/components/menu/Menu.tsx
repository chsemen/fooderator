import React, { ReactElement, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { none, useHookstate } from "@hookstate/core";
import axios from "axios";
import {
    Button, Layout, PageHeader, List, Dropdown, Menu, notification,
    MenuProps,
    Spin
} from "antd";
const { Footer, Content } = Layout;
import globalState, { IMenuItem, IRecipe, getIndexOfRecipeByID }
    from "../../globalState";


export default (): ReactElement => {
    const navigate: NavigateFunction = useNavigate();
    const gs = useHookstate(globalState);
    const [showSpinner, setShowSpinner] = useState(false as boolean)

    const handleAdd: MenuProps["onClick"] = ({ key }) => {
        if (typeof gs.menuItems.get().find(
            inRecipe => inRecipe.id === parseInt(key)
        ) !== "undefined") {
            notification.error({
                message: "Duplicate",
                description: "That recipe is already on the menu"
            });
        } else {
            setShowSpinner(true);
            const menuItem: IMenuItem = { recipe: parseInt(key) };
            (async () => {
                const response: any = await axios.post("/api/v1/menuitem/", menuItem);
                gs.menuItems.merge([response.data])
                setShowSpinner(false);
                notification.success({
                    message: "Recipe Added",
                    description: "The recipe has been added to the menu"
                });
            })();
        }
    };

    const handleRemove: Function = (inMenuItemID: number, inIndex: number) => {
        setShowSpinner(true);
        (async () => {
            const response: any = await axios.delete(`/api/v1/menuitem/${inMenuItemID}/`);
            gs.menuItems[inIndex].set(none);
            setShowSpinner(false);
            notification.success({
                message: "Recipe Removed",
                description: "The recipe has been removed from the menu"
            });
        })();
    };

    const getRecipeForItem: Function = (inRecipeID: number): IRecipe => {
        const indexOfRecipeInGSRecipes: number =
            getIndexOfRecipeByID(inRecipeID, "recipes");
        const recipe = gs.recipes.get()[indexOfRecipeInGSRecipes];
        return recipe;
    };

    return (
        <Spin size="large" spinning={showSpinner}>
            <Layout style={{ height: "100vh" }}>
                <PageHeader title="Home" subTitle="Menu"
                    onBack={(): void => {
                        navigate("/static/index.html", { replace: true }
                        );
                    }}>
                </PageHeader>

                <Content style={{
                    color: "#ffffff", overflow: "auto", display: "flex", flexDirection:
                        "column",
                    justifyContent: "normal", alignItems: "center"
                }}>
                    <List itemLayout="horizontal" dataSource={gs.menuItems.get()} style={{
                        width: 640
                    }}
                        renderItem={(inMenuItem, inIndex) => (
                            <List.Item key={inMenuItem.id}
                                actions={[<Button type="primary" shape="round"
                                    onClick={(): void => {
                                        handleRemove(inMenuItem.id,
                                            inIndex);
                                    }}>
                                    Remove
                                </Button>]}>
                                <List.Item.Meta description={getRecipeForItem(inMenuItem.recipe).
                                    description}
                                    title={
                                        <Button type="text" style={{ paddingLeft: 0 }}>
                                            {getRecipeForItem(inMenuItem.recipe).name}
                                        </Button>
                                    } />
                            </List.Item>
                        )} />
                </Content>

                <Footer style={{
                    display: "flex", flexDirection: "column", alignItems:
                        "center"
                }}>
                    <Dropdown placement="top" trigger={["click"]}
                        arrow={{ pointAtCenter: true }}
                        overlay={
                            <Menu onClick={handleAdd}
                                items={gs.recipes.get().map(inRecipe => {
                                    return ({ key: inRecipe.id, label: inRecipe.name });
                                })} />
                        }>
                        <Button type="primary" shape="round">Add Recipe</Button>
                    </Dropdown>
                </Footer>
            </Layout>
        </Spin>
    );
}