# Presentation Patterns

A user cancels an order. An open screen may refresh its status, or the server may return a new HTML page. Both require separating input handling, displayed information and application behavior, but their interactions differ. These patterns describe that separation at the [Presentation](../../../GLOSSARY.md#presentation-layer) boundary.

## Context matters

MVC and MVVM describe responsibilities; frontend, backend, desktop and mobile describe where code runs. The environment alone does not determine the pattern or its connections.

| Arrangement | How the parts interact | Source |
| --- | --- | --- |
| Classic interactive MVC | The Controller invokes Model behavior. The View observes changes and reads the Model to redraw. | [Fowler: MVC](https://martinfowler.com/eaaDev/uiArchs.html#ModelViewController) |
| Server-rendered web MVC | The Controller works with the Model, selects a View and supplies its data. The View generates HTML for that response. | [ASP.NET Core: MVC](https://learn.microsoft.com/en-us/aspnet/core/mvc/overview?view=aspnetcore-10.0#mvc-pattern) |
| Interactive MVVM | The View consumes ViewModel state and invokes its commands. Binding synchronizes the display; the ViewModel uses underlying Model capabilities. | [.NET MAUI: MVVM](https://learn.microsoft.com/en-us/dotnet/architecture/maui/mvvm) |
| Server template data named `ViewModel` | A Controller prepares data for a template. The name alone does not establish MVVM's interactive state and behavior separation. | [ASP.NET Core: Model responsibilities](https://learn.microsoft.com/en-us/aspnet/core/mvc/overview?view=aspnetcore-10.0#model-responsibilities) |

The last distinction compares the documented roles, rather than treating identical names as identical patterns. React's [components, props and state](https://react.dev/learn/thinking-in-react) likewise do not automatically establish MVC or MVVM. A frontend and its backend can choose different internal arrangements; a [JSON endpoint](https://docs.nestjs.com/controllers#routing) does not require an HTML View.

## Guides

- [MVC](model-view-controller/README.md): separate the Model, View and gesture interpretation.
- [MVVM](model-view-viewmodel/README.md): expose view state and commands through a [ViewModel](../../../GLOSSARY.md#viewmodel).

The detailed comparisons explain [MVC across client and server](model-view-controller/README.md#mvc-across-client-and-server) and [MVVM across UI platforms and server code](model-view-viewmodel/README.md#mvvm-across-ui-platforms-and-server-code), including the scope of their diagrams.

For application/domain boundaries, begin with [Foundations](../../foundations/README.md). For React files, use [Frontend Presentation](../../frontend/presentation-architecture.md).

[Architecture](../../README.md)
