import React, { ReactElement, useEffect, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { Layout, PageHeader, Spin, Table } from "antd";
import axios from "axios";
const { Content } = Layout;

export interface IShoppingListItem {
    name: string,
    amount: number,
    amount_unit: string
}

export default (): ReactElement => {
    const navigate: NavigateFunction = useNavigate();
    const [showSpinner, setShowSpinner] = useState(true as boolean);
    const [shoppingListItems, setShoppingListItems] =
        useState([] as Array<IShoppingListItem>);

    useEffect((): void => {
        (async () => {
            const responseShoppingListItems: any = await axios.get("/makeShoppingList");
            setShoppingListItems(responseShoppingListItems.data);
            setShowSpinner(false);
        })();
    }, []);

    return (
        <Spin size="large" spinning={showSpinner}>
            <Layout style={{ height: "100vh" }}>
                <PageHeader title="Home" subTitle="Shopping List"
                    onBack={(): void => {
                        navigate("/static/index.html", { replace: true });
                    }
                    }>
                </PageHeader>
                <Content>
                    <Table sticky={true} dataSource={shoppingListItems}
                        rowKey={(inRecord) => inRecord.name}
                        columns={[
                            { title: "Name", dataIndex: "name", key: "name" },
                            { title: "Amount", dataIndex: "amount", key: "amount" },
                            { title: "Units", dataIndex: "amount_unit", key: "amountUnit" }
                        ]}
                    />
                </Content>
            </Layout>
        </Spin>
    )
}