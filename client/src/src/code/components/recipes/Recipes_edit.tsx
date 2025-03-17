import React, { MouseEventHandler, ReactElement, useEffect, useState } from
    "react";
import {
    Button, Divider, Form, Input, InputNumber, List, Modal,
    notification, Popconfirm,
    Rate, Space, Spin
} from "antd";
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
const { TextArea } = Input;
import { none, useHookstate } from "@hookstate/core";
import globalState, { IIngredient, IRecipe, getIndexOfRecipeByID }
    from "../../globalState";
import axios from "axios";

export default (inProps): ReactElement => {
    const gs = useHookstate(globalState);
    const [form] = Form.useForm();
    const [ingredients, setIngredients] = useState([] as Array<IIngredient>);
    const [addIngredientData, setAddIngredientData] =
        useState({ name: "", amount: 0, amount_unit: "" } as IIngredient);
    const [showSpinner, setShowSpinner] = useState(false as boolean);

    useEffect((): void => {
        if (inProps.recipeID !== -1) {
            const indexOfRecipeInGSRecipes: number =
                getIndexOfRecipeByID(inProps.recipeID, "recipes");
            const recipe: IRecipe = gs.recipes.get()[indexOfRecipeInGSRecipes];
            form.setFieldsValue({
                name: recipe.name, description: recipe.description, rating:
                    recipe.rating,
                serves: recipe.serves
            });
            setIngredients([...recipe.ingredient_set]);
        }
    }, []);

    const handleChanges = (changedFields, allFields): void => {
        const changedFieldName: string = changedFields[0].name[0];
        const locationOfPipe: number = changedFieldName.indexOf("|");
        if (locationOfPipe !== -1) {
            const aid: any = { ...addIngredientData };
            aid[changedFieldName.substring(locationOfPipe + 1)] =
                changedFields[0].value;
            setAddIngredientData(aid)
        }
    };

    const handleAddIngredient: MouseEventHandler = (): void => {
        addIngredientData.name = addIngredientData.name.trim();
        setIngredients(ingredients.concat({ ...addIngredientData }));
        setAddIngredientData({ name: "", amount: 0, amount_unit: "" })
        form.setFieldsValue({
            "addIngredient|name": "",
            "addIngredient|amount": "",
            "addIngredient|amount_unit": ""
        });
    };

    const handleRemoveIngredient: Function = (inIndex: number): void => {
        const ing: Array<IIngredient> = ingredients.filter((v, i) => inIndex
            !== i);
        setIngredients(ing);
    };

    const handleSave = (inValues: any): void => {
        setShowSpinner(true);
        const recipe: IRecipe = {
            name: inValues.name,
            description: inValues.description,
            rating: inValues.rating,
            serves: inValues.serves,
            ingredient_set: ingredients.map((inIngredient) => {
                return {
                    ...
                    inIngredient
                };
            })
        };
        if (inProps.recipeID === -1) {
            (async () => {
                const response: any = await axios.post("/api/v1/recipe/", recipe);
                gs.recipes.merge([response.data])
                notification.success({
                    message: "Recipe Saved",
                    description: "The recipe has been saved"
                });
                inProps.setIsEditVisible(false);
            })();
        } else {
            recipe.id = inProps.recipeID;
            (async () => {
                const response: any = await axios.put(`/api/v1/recipe/${recipe.id}/`,
                    recipe);
                const indexOfRecipeInGSRecipes: number =
                    getIndexOfRecipeByID(inProps.recipeID, "recipes");
                gs.recipes[indexOfRecipeInGSRecipes].set(response.data);
                notification.success({
                    message: "Recipe Saved",
                    description: "The recipe has been updated"
                });
                inProps.setIsEditVisible(false);
            })();
        }
    };

    const handleDeleteConfirm: MouseEventHandler = (): void => {
        setShowSpinner(true);
        (async () => {
            const response: any = await axios.delete(`/api/v1/recipe/${inProps.recipeID}/`);
            const indexOfRecipeInGSRecipes: number =
                getIndexOfRecipeByID(inProps.recipeID, "recipes");
            gs.recipes[indexOfRecipeInGSRecipes].set(none);
            const indexOfRecipeInGSMenuItems: number =
                getIndexOfRecipeByID(inProps.recipeID, "menuItems");
            gs.menuItems[indexOfRecipeInGSMenuItems].set(none);
            notification.success({
                message: "Recipe Deleted",
                description: "The recipe has been deleted"
            });
            inProps.setIsEditVisible(false);
        })();
    }

    return (
        <Modal title={inProps.editMode} visible={inProps.isEditVisible} centered
            footer={null}
            destroyOnClose={true}
            style={{ boxShadow: "0px 0px 30px 20px rgba(255, 255, 255, 0.5)" }}
            closable={false}>
            <Spin size="large" spinning={showSpinner}>
                <Form name="editRecipe" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}
                    preserve={false} form={form}
                    initialValues={{ name: "", description: "", rating: 1, serves: 1 }}
                    onFinish={handleSave} autoComplete="off" onFieldsChange={handleChanges}>

                    <Form.Item label="Name" name="name"
                        rules={[{ required: true, message: "Please enter a name for this recipe" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Description" name="description"
                        rules={[{ required: true, message: "Please enter a description for this recipe" }]}>
                        <TextArea />
                    </Form.Item>
                    <Form.Item label="Rating" name="rating" rules={[{ required: false }]}>
                        <Rate />
                    </Form.Item>
                    <Form.Item label="Serves" name="serves"
                        rules={[{ required: true, message: "Please enter how many people this recipe serves" }]}>
                        <InputNumber />
                    </Form.Item>
                    <Divider orientation="left">Ingredients</Divider>
                    <Space align="baseline">
                        <Form.Item name="addIngredient|name" rules=
                            {[{ required: false, message: "Required" }]}>
                            <Input value={addIngredientData.name} placeholder="Name" style={{
                                width: 210
                            }} />
                        </Form.Item>
                        <Form.Item name="addIngredient|amount"
                            rules={[{ required: false, message: "Required" }]}>
                            <InputNumber value={addIngredientData.amount} placeholder="Amount"
                                style={{ width: 90 }} />
                        </Form.Item>
                        <Form.Item name="addIngredient|amount_unit"
                            rules={[{ required: false, message: "Required" }]}>
                            <Input value={addIngredientData.amount_unit} placeholder="Unit"
                                style={{ width: 130 }} />
                        </Form.Item>
                        <PlusCircleOutlined onClick={handleAddIngredient} />
                    </Space>
                    <div style={{ height: "210px", overflow: "auto" }}>
                        <List itemLayout="horizontal" dataSource={ingredients}
                            renderItem={(inIngredient: IIngredient, inIndex: number) => (
                                <List.Item key={inIndex}
                                    actions={[
                                        <MinusCircleOutlined onClick={(): void =>
                                            handleRemoveIngredient(inIndex)} />
                                    ]}>
                                    <List.Item.Meta title={
                                        ` ${inIngredient.name} ${inIngredient.amount} ${inIngredient.
                                            amount_unit}`
                                    } />
                                </List.Item>
                            )}
                        />
                    </div>
                    <Divider orientation="left" />
                    <Form.Item wrapperCol={{ offset: 13, span: 16 }}>
                        <Space>
                            <Button type="text" onClick={() => {
                                inProps.setIsEditVisible(false);
                            }
                            }>Cancel</Button>
                            <Popconfirm title="Are you sure to delete this recipe?"
                                okText="Delete" okType="danger" cancelButtonProps={{ type: "text" }}
                                cancelText="Cancel"
                                onConfirm={handleDeleteConfirm}>
                                <Button danger disabled={inProps.editMode === "Add Recipe"}>Delete</Button>
                            </Popconfirm>
                            <Button type="primary" htmlType="submit">Save</Button>
                        </Space>
                    </Form.Item>
                </Form>

            </Spin>
        </Modal >
    )
}