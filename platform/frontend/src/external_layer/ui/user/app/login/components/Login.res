open Antd
%%raw("import 'antd/dist/antd.css'")

type values = {username: string, password: string}

@react.component
let make = () => {
  let dispatch = AppStore.useDispatch()

  let _onFinish = values => {
    let {username, password} = values->Obj.magic

    BackendCloudbase.isLoginSuccess(username, password)
    ->Meta3dBsMost.Most.tap(((isSuccess, failMsg)) => {
      !isSuccess
        ? {
            Message.error(Meta3dCommonlib.NullableSt.getExn(failMsg))

            ()
          }
        : {
            dispatch(AppStore.UserCenterAction(UserCenterStore.SetUserName(username)))

            RescriptReactRouter.push("/")
          }
    }, _)
    ->Meta3dBsMost.Most.drain
    ->Obj.magic
  }

  let _onFinishFailed = errorInfo => {
    Message.error({j`Failed: ${errorInfo->Obj.magic->Js.Json.stringify}`})
  }

  <>
    <Nav />
    <Button
      onClick={_ => {
        RescriptReactRouter.push("/Register")
      }}>
      {React.string(`注册`)}
    </Button>
    <Form
    // name="basic"
      labelCol={{
        "span": 8,
      }}
      wrapperCol={{
        "span": 6,
      }}
      initialValues={{
        "remember": true,
      }}
      onFinish={_onFinish}
      onFinishFailed={_onFinishFailed}
      autoComplete="off">
      <Form.Item
        label=`用户名`
        name="username"
        rules={[
          {
            required: true,
            message: `输入用户名`,
          },
        ]}>
        <Input />
      </Form.Item>
      <Form.Item
        label=`密码`
        name="password"
        rules={[
          {
            required: true,
            message: `输入密码`,
          },
        ]}>
        // <Input.Password />
        <Input _type="password" />
      </Form.Item>
      <Form.Item
        wrapperCol={{
          "offset": 8,
          "span": 16,
        }}>
        <Button htmlType="submit"> {React.string(`登录`)} </Button>
      </Form.Item>
    </Form>
  </>
}
