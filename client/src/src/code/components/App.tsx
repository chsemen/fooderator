import React, { ReactElement, useEffect, useState } from "react";
import { Spin } from "antd";
import { Link } from "react-router-dom";
import { useHookstate } from "@hookstate/core";
import axios from "axios";
import globalState from "../globalState";

export default (): ReactElement => {
    const gs = useHookstate(globalState);
    const [showSpinner, setShowSpinner] = useState(false as boolean);

    useEffect((): void => {
        if (gs.initialLoadComplete.get() === false) {
            setShowSpinner(true);
            (async () => {
                const responseRecipes: any = await axios.get("/api/v1/recipe/");
                const responseMenuItems: any = await axios.get("/api/v1/menuitem/");
                gs.recipes.merge([...responseRecipes.data]);
                gs.menuItems.merge([...responseMenuItems.data]);
                setShowSpinner(false);
                gs.initialLoadComplete.set(true);
            })();
        }
    }, []);

    return (
        <div style={{
            textAlign: "center", position: "relative", top: "50%", transform:
                "translateY(-50%)"
        }}>
            <Spin size="large" spinning={showSpinner}>
                <h1>Fooderator Client</h1>
                <div style={{ padding: "10px" }}>
                    <Link to="recipes"><img src="/static/recipes.png" alt="Recipes" />
                    </Link>
                </div>
                <div style={{ padding: "10px" }}>
                    <Link to="menu"><img src="/static/menu.png" alt="Menu" /></Link>
                </div>
                <div style={{ padding: "10px" }}>
                    <Link to="shoppingList"><img src="/static/shopping_list.png"
                        alt="Shopping List" /></Link>
                </div>
            </Spin>
        </div>
    );
}